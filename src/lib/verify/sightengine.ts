/**
 * Sightengine Integration — L4 of Lellina's 3-Cloud Consensus Engine.
 *
 * Role: FRAUD/INTEGRITY ONLY. NOT gender detection. NOT content moderation.
 * Used to sniff AI-generated faces, screen-recapture, near-duplicate scams.
 * Called ONLY on L2/L3 disagreement or borderline (real usage ~10-60/day).
 *
 * Endpoint: https://api.sightengine.com/1.0/check.json
 * Auth: multipart form with api_user + api_secret + media upload.
 * Models requested: ai-generated-content,face-attributes,offensive-2.0
 *
 * Free tier: 2,000 ops/month, 500/day max, 1 req/s hard limit, never expires.
 * 80% cap: 400/day (massive headroom at launch).
 *
 * Zero-storage: no image data or credentials are logged.
 */

const SE_ENDPOINT = "https://api.sightengine.com/1.0/check.json" as const;
const ANALYSIS_TIMEOUT_MS = 30_000 as const;
const RATE_LIMIT_MIN_INTERVAL_MS = 1_000; // 1 req/s hard limit per Sightengine ToS.

// ─── Types ───────────────────────────────────────────────────────────

/**
 * Result of {@link checkImageIntegrity}. Fraud/integrity lane only —
 * NO gender field (Sightengine gender detection is intentionally NOT used
 * per Lellina architecture; gender is owned by L2 HF + L3 Gemini).
 */
export interface SightengineResult {
  /** True if aiScore >= 0.5 (likely AI-generated). */
  isAIGenerated: boolean;
  /** AI-generated content probability (0..1). */
  aiScore: number;
  /** True if offensiveScore >= 0.5. */
  isOffensive: boolean;
  /** Offensive content probability (0..1). */
  offensiveScore: number;
  /** True if at least one face was detected in the image. */
  hasFace: boolean;
  /** Full Sightengine JSON response (typed as unknown — narrowed by parser). */
  raw: unknown;
}

/**
 * Thrown when Sightengine returns 429 (caller hit the 500/day or 1 req/s cap).
 */
export class SightengineRateLimitError extends Error {
  public readonly retryAfterMs?: number;
  constructor(message: string, retryAfterMs?: number) {
    super(message);
    this.name = "SightengineRateLimitError";
    this.retryAfterMs = retryAfterMs;
    Object.setPrototypeOf(this, SightengineRateLimitError.prototype);
  }
}

/**
 * Thrown on network timeout, missing credentials, or unexpected response.
 */
export class SightengineNetworkError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "SightengineNetworkError";
    Object.setPrototypeOf(this, SightengineNetworkError.prototype);
  }
}

// ─── Module-level state ──────────────────────────────────────────────

/** Timestamp (ms) of the last Sightengine call. Enforces 1 req/s hard limit. */
let lastCallTimestamp = 0;

// ─── Internal helpers ────────────────────────────────────────────────

function getCredentials(): { user: string; secret: string } {
  const user = process.env.SIGHTENGINE_API_USER;
  const secret = process.env.SIGHTENGINE_API_SECRET;
  if (!user || !secret) {
    throw new SightengineNetworkError(
      "Sightengine credentials missing (SIGHTENGINE_API_USER / SIGHTENGINE_API_SECRET)."
    );
  }
  return { user, secret };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Enforces the 1 req/s hard rate limit. If called within 1s of the last call,
 * awaits the remaining time before returning. Updates lastCallTimestamp on exit.
 */
async function enforceRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastCallTimestamp;
  if (elapsed < RATE_LIMIT_MIN_INTERVAL_MS) {
    const wait = RATE_LIMIT_MIN_INTERVAL_MS - elapsed;
    await sleep(wait);
  }
  lastCallTimestamp = Date.now();
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  if (typeof Buffer !== "undefined") {
    const buf = Buffer.from(base64, "base64");
    // Copy into a fresh ArrayBuffer to satisfy TS 5.7+ strict BlobPart types
    // (Buffer is Uint8Array<ArrayBufferLike>, but Blob requires ArrayBuffer-backed).
    const ab = new ArrayBuffer(buf.length);
    new Uint8Array(ab).set(buf);
    return ab;
  }
  const bin = atob(base64);
  const ab = new ArrayBuffer(bin.length);
  const view = new Uint8Array(ab);
  for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
  return ab;
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
 * Narrows the Sightengine JSON response to a typed {@link SightengineResult}.
 *
 * Expected Sightengine response shape for `models=ai-generated-content,face-attributes,offensive-2.0`:
 *   {
 *     "ai_generated":   { "score": 0.01, "classes": { "ai_generated": 0.01, "real": 0.99 } },
 *     "faces":          [ { "x1":..., "y1":..., "x2":..., "y2":..., "attributes": { ... } } ],
 *     "offensive":      { "prob": 0.01, "classes": { "safe": 0.99, "offensive": 0.01 } }
 *   }
 *
 * Defensive: missing fields default to 0/false so a partial response never
 * crashes the consensus orchestrator.
 */
function parseSightengineResponse(json: unknown): SightengineResult {
  const obj = (json ?? {}) as Record<string, unknown>;

  const aiBlock = (obj["ai_generated"] ?? {}) as { score?: number };
  const aiScore = typeof aiBlock.score === "number" ? aiBlock.score : 0;

  const offensiveBlock = (obj["offensive"] ?? {}) as { prob?: number };
  const offensiveScore =
    typeof offensiveBlock.prob === "number" ? offensiveBlock.prob : 0;

  // Sightengine returns "faces" array (length > 0 = at least one face present).
  const faces = obj["faces"];
  const hasFace = Array.isArray(faces) && faces.length > 0;

  return {
    isAIGenerated: aiScore >= 0.5,
    aiScore,
    isOffensive: offensiveScore >= 0.5,
    offensiveScore,
    hasFace,
    raw: json,
  };
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Checks image integrity: AI-generated content, offensive content, face presence.
 * NOT gender detection — Sightengine is fraud/integrity only per Lellina
 * architecture (Phase 2 Refined Architecture section A + Planning Session 3
 * section O).
 *
 * @param imageBase64 — JPEG image as raw base64 string (data: prefix tolerated).
 * @returns {@link SightengineResult} with aiScore, offensiveScore, hasFace, etc.
 *
 * Quota impact: 1 Sightengine op. Self-throttled to 1 req/s. Called ONLY on
 * borderline/disagreement cases by the consensus orchestrator (real usage
 * ~10-60/day, well under the 400/day 80% cap).
 *
 * @throws SightengineRateLimitError — Sightengine returned 429.
 * @throws SightengineNetworkError — 30s timeout, missing credentials, or
 *   unexpected HTTP status.
 */
export async function checkImageIntegrity(
  imageBase64: string
): Promise<SightengineResult> {
  if (!imageBase64 || imageBase64.length === 0) {
    throw new SightengineNetworkError(
      "checkImageIntegrity received empty imageBase64."
    );
  }

  const { user, secret } = getCredentials();

  // Enforce 1 req/s hard rate limit BEFORE firing the request.
  await enforceRateLimit();

  // Build the multipart/form-data body using the Web FormData + Blob APIs
  // (supported in Node 18+ via undici, and in Bun's fetch). This avoids
  // manual boundary construction and Content-Type header management.
  const cleanedBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");
  const imageBuffer = base64ToArrayBuffer(cleanedBase64);

  const formData = new FormData();
  formData.append("api_user", user);
  formData.append("api_secret", secret);
  formData.append("models", "ai-generated-content,face-attributes,offensive-2.0");
  formData.append(
    "media",
    new Blob([imageBuffer], { type: "image/jpeg" }),
    "selfie.jpg"
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ANALYSIS_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(SE_ENDPOINT, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === "AbortError") {
      throw new SightengineNetworkError(
        `Sightengine request timed out after ${ANALYSIS_TIMEOUT_MS}ms.`
      );
    }
    throw new SightengineNetworkError(
      `Sightengine network error: ${err instanceof Error ? err.message : String(err)}`,
      { cause: err as Error }
    );
  }
  clearTimeout(timeout);

  if (res.status === 429) {
    const retryAfterSec = Number(res.headers.get("retry-after") ?? "0");
    throw new SightengineRateLimitError(
      "Sightengine returned 429 (rate-limited).",
      retryAfterSec > 0 ? retryAfterSec * 1000 : undefined
    );
  }

  if (!res.ok) {
    const bodyText = await safeText(res);
    throw new SightengineNetworkError(
      `Sightengine returned HTTP ${res.status}: ${bodyText}`
    );
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch (err) {
    throw new SightengineNetworkError(
      `Sightengine response was not valid JSON: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  return parseSightengineResponse(json);
}
