/**
 * HuggingFace Inference API — L2 of Lellina's 3-Cloud Consensus Engine.
 *
 * Model: rizvandwiki/gender-classification (purpose-trained gender classifier).
 * Endpoint: https://api-inference.huggingface.co/models/rizvandwiki/gender-classification
 * Auth: Bearer ${HUGGINGFACE_TOKEN}
 *
 * Free tier: ~300 req/hr dynamic, 2MB image max, cold-start 20-90s.
 * 80% cap: ~2400/day (well above realistic launch usage).
 *
 * Cold-start killer: wakeModel() pings the endpoint with a 1x1 pixel image
 * to trigger model load. Fire-and-forget on /verify page entry so the model
 * is warm by the time the user finishes the intro and positions their face.
 *
 * Zero-storage: no image data or credentials are logged.
 */

const HF_MODEL_URL =
  "https://api-inference.huggingface.co/models/rizvandwiki/gender-classification" as const;

const ANALYSIS_TIMEOUT_MS = 30_000 as const;
const WAKE_TIMEOUT_MS = 3_000 as const;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB decoded

/**
 * 1x1 white JPEG (631 bytes, generated via Python PIL). Valid JFIF/JPEG.
 * Used by wakeModel() as a fire-and-forget ping payload — the classification
 * result is irrelevant; we only need to trigger model load.
 */
const WAKE_PIXEL_BASE64 =
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD2aiiigD//2Q==" as const;

// ─── Types ───────────────────────────────────────────────────────────

/**
 * Result of {@link classifyGender}. label is always "female" or "male" (lowercase).
 * `raw` is the full HF response array (typed as unknown — narrowed by parser).
 */
export interface HFGenderResult {
  label: "female" | "male";
  confidence: number; // 0..1
  raw: unknown;
}

/**
 * Thrown when HF returns 429. `retryAfterMs` carries the Retry-After header
 * value (ms) if HF provided one.
 */
export class HFRateLimitError extends Error {
  public readonly retryAfterMs?: number;
  constructor(message: string, retryAfterMs?: number) {
    super(message);
    this.name = "HFRateLimitError";
    this.retryAfterMs = retryAfterMs;
    Object.setPrototypeOf(this, HFRateLimitError.prototype);
  }
}

/**
 * Thrown when the decoded image exceeds the 2MB HF limit. Carries size + max
 * for caller-friendly error messaging.
 */
export class HFImageTooLargeError extends Error {
  public readonly sizeBytes: number;
  public readonly maxBytes: number;
  constructor(sizeBytes: number, maxBytes: number = MAX_IMAGE_BYTES) {
    super(`HuggingFace image too large: ${sizeBytes} bytes (max ${maxBytes}).`);
    this.name = "HFImageTooLargeError";
    this.sizeBytes = sizeBytes;
    this.maxBytes = maxBytes;
    Object.setPrototypeOf(this, HFImageTooLargeError.prototype);
  }
}

/**
 * Thrown when HF remains 503 (model still loading) after all backoff retries
 * (1.5s / 3s / 6s, max 3 retries). Caller should fall back to L3 alone.
 */
export class HFModelLoadingError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "HFModelLoadingError";
    Object.setPrototypeOf(this, HFModelLoadingError.prototype);
  }
}

/**
 * Thrown on network timeout, missing credentials, or unexpected HF response
 * shape. Wraps the underlying cause via ErrorOptions.
 */
export class HFNetworkError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "HFNetworkError";
    Object.setPrototypeOf(this, HFNetworkError.prototype);
  }
}

// ─── Internal helpers ────────────────────────────────────────────────

/**
 * Decodes a base64 string and returns its byte length.
 * Used for the 2MB image size check before sending to HF.
 *
 * Uses Buffer when available (Node/Bun) and falls back to atob for non-Node.
 */
function decodedByteLength(base64: string): number {
  // Strip optional data: prefix if present.
  const cleaned = base64.replace(/^data:[^;]+;base64,/, "");
  if (typeof Buffer !== "undefined") {
    return Buffer.byteLength(cleaned, "base64");
  }
  // Fallback: atob returns a binary string; its .length = decoded byte count.
  try {
    return atob(cleaned).length;
  } catch {
    // Last resort: estimate from base64 length (4 chars -> 3 bytes).
    return Math.floor((cleaned.length * 3) / 4);
  }
}

/**
 * Decodes base64 to an ArrayBuffer suitable for fetch body (octet-stream).
 * Returns ArrayBuffer (not Uint8Array) to satisfy the TS 5.7+ DOM lib's
 * strict BodyInit / BlobPart types — ArrayBuffer is universally accepted
 * by both fetch() and Blob().
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const cleaned = base64.replace(/^data:[^;]+;base64,/, "");
  if (typeof Buffer !== "undefined") {
    const buf = Buffer.from(cleaned, "base64");
    // Copy into a fresh ArrayBuffer (Buffer may share its underlying buffer
    // with the pool; this also avoids SharedArrayBuffer type friction).
    const ab = new ArrayBuffer(buf.length);
    new Uint8Array(ab).set(buf);
    return ab;
  }
  // Fallback: atob (non-Node environments).
  const bin = atob(cleaned);
  const ab = new ArrayBuffer(bin.length);
  const view = new Uint8Array(ab);
  for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
  return ab;
}

function getToken(): string {
  const token = process.env.HUGGINGFACE_TOKEN;
  if (!token) {
    throw new HFNetworkError("HUGGINGFACE_TOKEN is not configured.");
  }
  return token;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeText(res: Response): Promise<string> {
  try {
    const t = await res.text();
    return t.slice(0, 300);
  } catch {
    return "<no body>";
  }
}

/**
 * Parses the HF gender-classification response. Expected shape:
 *   [{ "label": "female", "score": 0.98 }, { "label": "male", "score": 0.02 }]
 * Picks the entry with the highest score and validates the label.
 */
function parseHFResponse(json: unknown): HFGenderResult {
  if (!Array.isArray(json) || json.length === 0) {
    throw new HFNetworkError(
      `HuggingFace returned unexpected response shape: ${JSON.stringify(json).slice(0, 200)}`
    );
  }
  let best: { label: string; score: number } | null = null;
  for (const item of json) {
    if (
      item &&
      typeof item === "object" &&
      "label" in item &&
      "score" in item &&
      typeof (item as { label: unknown }).label === "string" &&
      typeof (item as { score: unknown }).score === "number"
    ) {
      const candidate = item as { label: string; score: number };
      if (!best || candidate.score > best.score) best = candidate;
    }
  }
  if (!best) {
    throw new HFNetworkError(
      `HuggingFace response had no valid {label,score} entries: ${JSON.stringify(json).slice(0, 200)}`
    );
  }
  const label = best.label.toLowerCase();
  if (label !== "female" && label !== "male") {
    throw new HFNetworkError(
      `HuggingFace returned unexpected label: ${best.label}`
    );
  }
  return {
    label,
    confidence: best.score,
    raw: json,
  };
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Classifies the gender of the subject in the image using the
 * `rizvandwiki/gender-classification` model (L2 lane).
 *
 * @param imageBase64 — JPEG/PNG image as raw base64 string (data: prefix tolerated).
 * @returns {@link HFGenderResult} with label ("female" | "male"), confidence (0..1), raw.
 *
 * Quota impact: 1 HF inference call (free tier ~300 req/hr dynamic).
 * On 503 (model loading), retries with 1.5s / 3s / 6s exponential backoff
 * (max 3 retries = 4 total attempts). On 429, throws immediately.
 *
 * @throws HFImageTooLargeError — decoded image > 2MB.
 * @throws HFRateLimitError — HF returned 429.
 * @throws HFModelLoadingError — model still loading after 3 backoff retries.
 * @throws HFNetworkError — 30s timeout, missing credentials, or unexpected response.
 */
export async function classifyGender(
  imageBase64: string
): Promise<HFGenderResult> {
  if (!imageBase64) {
    throw new HFNetworkError("classifyGender received empty imageBase64.");
  }

  // Enforce 2MB decoded size limit BEFORE sending.
  const sizeBytes = decodedByteLength(imageBase64);
  if (sizeBytes > MAX_IMAGE_BYTES) {
    throw new HFImageTooLargeError(sizeBytes);
  }

  const token = getToken();
  const body = base64ToArrayBuffer(imageBase64);

  // 1.5s / 3s / 6s backoff schedule for 503 (model loading) errors.
  const backoffScheduleMs = [1_500, 3_000, 6_000] as const;
  let lastLoadingError: HFModelLoadingError | null = null;

  // attempt 0 = initial fetch; attempts 1..3 = retries (with backoff before).
  for (let attempt = 0; attempt <= backoffScheduleMs.length; attempt++) {
    if (attempt > 0) {
      await sleep(backoffScheduleMs[attempt - 1] as number);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ANALYSIS_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(HF_MODEL_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/octet-stream",
        },
        body,
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === "AbortError") {
        throw new HFNetworkError(
          `HuggingFace request timed out after ${ANALYSIS_TIMEOUT_MS}ms.`
        );
      }
      throw new HFNetworkError(
        `HuggingFace network error: ${err instanceof Error ? err.message : String(err)}`,
        { cause: err as Error }
      );
    }
    clearTimeout(timeout);

    if (res.status === 429) {
      const retryAfterSec = Number(res.headers.get("retry-after") ?? "0");
      throw new HFRateLimitError(
        "HuggingFace returned 429 (rate-limited).",
        retryAfterSec > 0 ? retryAfterSec * 1000 : undefined
      );
    }

    if (res.status === 503) {
      // Model is loading — record the error and continue to backoff+retry.
      lastLoadingError = new HFModelLoadingError(
        `HuggingFace model loading (503). Attempt ${attempt + 1}/${backoffScheduleMs.length + 1}.`
      );
      continue;
    }

    if (!res.ok) {
      const bodyText = await safeText(res);
      throw new HFNetworkError(
        `HuggingFace returned HTTP ${res.status}: ${bodyText}`
      );
    }

    let json: unknown;
    try {
      json = await res.json();
    } catch (err) {
      throw new HFNetworkError(
        `HuggingFace response was not valid JSON: ${err instanceof Error ? err.message : String(err)}`
      );
    }
    return parseHFResponse(json);
  }

  // Exhausted all retries on 503.
  throw (
    lastLoadingError ??
    new HFModelLoadingError(
      "HuggingFace model failed to load after backoff retries."
    )
  );
}

/**
 * Cold-start killer. Pings the HF endpoint with a 1x1 pixel image to trigger
 * model load. Fire-and-forget — we don't care about the classification result.
 *
 * Used by the /verify page on mount so the model is warm by the time the user
 * finishes the 3-screen intro and positions their face in the viewfinder
 * (zero perceived delay — see Phase 2 Refined Architecture section F).
 *
 * @returns true if wake was triggered (503 = loading started, 200 = already warm).
 *          false on network error, missing token, or other non-503/200 status.
 *
 * Quota impact: 1 HF inference call (counts toward ~300/hr dynamic limit).
 * Timeout: hard 3 seconds (AbortController) — this is a background ping.
 */
export async function wakeModel(): Promise<boolean> {
  const token = process.env.HUGGINGFACE_TOKEN;
  if (!token) {
    return false;
  }

  const body = base64ToArrayBuffer(WAKE_PIXEL_BASE64);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WAKE_TIMEOUT_MS);
  try {
    const res = await fetch(HF_MODEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/octet-stream",
      },
      body,
      signal: controller.signal,
    });
    // 200 = already warm. 503 = model loading started (wake triggered).
    // Both count as success for our fire-and-forget purpose.
    if (res.status === 200 || res.status === 503) return true;
    return false;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
