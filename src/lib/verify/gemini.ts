/**
 * Gemini Integration — L3 of Lellina's 3-Cloud Consensus Engine.
 *
 * Uses @google/genai v2.14.0 (the NEW SDK — NOT @google/generative-ai).
 * Model: gemini-3.5-flash-lite
 *
 * Two API keys with round-robin rotation. On 429, switches to the other key
 * and retries once. If both keys 429, throws GeminiRateLimitError.
 *
 * Quota: 800/day effective cap (80% of 1000 RPD across 2 keys).
 * Per-call cost: 1 RPD from whichever key is selected.
 *
 * Zero-storage: no image data or credentials are logged. Only quota warnings.
 */

import { GoogleGenAI } from "@google/genai";

// ─── Types ───────────────────────────────────────────────────────────

/**
 * Verdict returned by {@link analyzeSelfie}. Combines gender + liveness + reasoning.
 */
export interface GeminiVerdict {
  isFemale: boolean;
  isLive: boolean;
  confidence: number; // 0..1
  reasoning: string;
}

/**
 * Verdict returned by {@link checkLiveness} (night-trap path).
 */
export interface GeminiLivenessVerdict {
  isLive: boolean;
  confidence: number; // 0..1
  reasoning: string;
}

/**
 * Thrown when BOTH Gemini API keys return 429 (rate-limited), or when no keys
 * are configured. Caller should fall back to L2/L4 consensus or return 503.
 */
export class GeminiRateLimitError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "GeminiRateLimitError";
    Object.setPrototypeOf(this, GeminiRateLimitError.prototype);
  }
}

/**
 * Thrown when Gemini returns a response that cannot be parsed as the expected
 * JSON shape. The raw response text is preserved on `.rawResponse` for
 * debugging (NEVER logged automatically — caller decides).
 */
export class GeminiParseError extends Error {
  public readonly rawResponse: string;
  constructor(message: string, rawResponse: string) {
    super(message);
    this.name = "GeminiParseError";
    this.rawResponse = rawResponse;
    Object.setPrototypeOf(this, GeminiParseError.prototype);
  }
}

/**
 * Thrown when the Gemini request times out (30s) or fails at the network layer.
 */
export class GeminiNetworkError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "GeminiNetworkError";
    Object.setPrototypeOf(this, GeminiNetworkError.prototype);
  }
}

// ─── Module-level state ──────────────────────────────────────────────

const MODEL = "gemini-3.5-flash-lite" as const;
const ANALYSIS_TIMEOUT_MS = 30_000 as const;

/** 80% of effective daily cap (2 keys × 500 RPD = 1000, 80% = 800). */
const QUOTA_DAILY_CAP = 800 as const;
const QUOTA_WARN_FRACTION = 0.8 as const;

let callCountToday = 0;
let currentDayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)

/** Round-robin index. -1 = no key used yet; advances on each getNextKey() call. */
let lastKeyIndex = -1;

/**
 * Loaded once at module init. Filters out missing/empty keys.
 * If empty, every call throws GeminiRateLimitError ("no keys configured").
 */
const API_KEYS: string[] = (
  [process.env.GEMINI_API_KEY_1, process.env.GEMINI_API_KEY_2] as Array<
    string | undefined
  >
).filter((k): k is string => Boolean(k && k.length > 0));

// ─── Internal helpers ────────────────────────────────────────────────

/**
 * Detects whether a thrown error represents a Gemini 429 / quota / rate-limit.
 * The @google/genai SDK surfaces errors with `.status` (number) or `.code`,
 * and a human message that may contain "429", "rate limit", "quota", or
 * "RESOURCE_EXHAUSTED" (the canonical gRPC code name).
 */
function isRateLimitError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as {
    status?: number | string;
    code?: number | string;
    message?: string;
  };
  const numericStatus = Number(e.status ?? e.code);
  if (numericStatus === 429) return true;
  if (
    typeof e.message === "string" &&
    /429|rate.?limit|quota|resource.?exhausted/i.test(e.message)
  ) {
    return true;
  }
  return false;
}

/**
 * Returns the next API key (round-robin). Throws GeminiRateLimitError if
 * no keys are configured (treats keys-missing as a fatal availability failure
 * so the consensus orchestrator can fall back to L2/L4).
 */
function getNextKey(): string {
  if (API_KEYS.length === 0) {
    throw new GeminiRateLimitError(
      "No Gemini API keys configured (GEMINI_API_KEY_1 / GEMINI_API_KEY_2 missing)."
    );
  }
  lastKeyIndex = (lastKeyIndex + 1) % API_KEYS.length;
  return API_KEYS[lastKeyIndex] as string;
}

/**
 * Tracks daily quota usage. Resets counter when the UTC date changes.
 * Logs a warning the first time we cross the 80% threshold each day.
 * Logs ONLY the count and cap — never any image data or credentials.
 */
function trackQuota(): void {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== currentDayKey) {
    currentDayKey = today;
    callCountToday = 0;
  }
  callCountToday += 1;
  const warnAt = Math.floor(QUOTA_DAILY_CAP * QUOTA_WARN_FRACTION);
  if (callCountToday === warnAt) {
    console.warn(
      `[gemini] Quota warning: ${callCountToday}/${QUOTA_DAILY_CAP} calls today (80% of effective cap).`
    );
  }
}

/**
 * Returns current daily quota usage for observability endpoints / admin dashboards.
 */
export function getGeminiQuotaUsage(): {
  calls: number;
  cap: number;
  pct: number;
} {
  return {
    calls: callCountToday,
    cap: QUOTA_DAILY_CAP,
    pct: callCountToday / QUOTA_DAILY_CAP,
  };
}

/**
 * Extracts a JSON object from a free-form Gemini text response.
 * Handles markdown code fences (```json ... ```) and leading/trailing prose.
 * Throws GeminiParseError if no JSON object can be located.
 */
function extractJSON(text: string): unknown {
  const trimmed = text.trim();
  // Strip markdown code fences if present.
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const candidate = fenced ? (fenced[1] as string) : trimmed;
  // Try direct parse first.
  try {
    return JSON.parse(candidate);
  } catch {
    // Fall back to grabbing the first {...} block.
    const objMatch = candidate.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try {
        return JSON.parse(objMatch[0] as string);
      } catch {
        // fall through
      }
    }
    throw new GeminiParseError(
      "Gemini response did not contain a parseable JSON object.",
      text
    );
  }
}

/**
 * Core Gemini call with one specific key. Applies a 30s AbortController.
 * Returns the raw text response. Bubbles 429s up to the rotation layer.
 */
async function callWithKey(
  key: string,
  prompt: string,
  imageBase64: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: key });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ANALYSIS_TIMEOUT_MS);
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { data: imageBase64, mimeType: "image/jpeg" } },
        ],
      },
      config: {
        abortSignal: controller.signal,
        temperature: 0.1,
      },
    });
    const text = response.text;
    if (!text) {
      throw new GeminiParseError("Gemini returned an empty response.", "");
    }
    return text;
  } catch (err) {
    if (err instanceof GeminiParseError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new GeminiNetworkError(
        `Gemini request timed out after ${ANALYSIS_TIMEOUT_MS}ms.`,
        { cause: err }
      );
    }
    // Rate-limit errors bubble up so callGemini can rotate keys.
    if (isRateLimitError(err)) throw err;
    // Wrap unknown SDK errors as network errors.
    throw new GeminiNetworkError(
      `Gemini request failed: ${err instanceof Error ? err.message : String(err)}`,
      { cause: err as Error }
    );
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Calls Gemini with round-robin rotation. On 429 from a key, tries the other
 * key once. If both keys 429 (or only one key configured and it 429s), throws
 * GeminiRateLimitError. Non-retryable errors (network, parse) are surfaced
 * immediately without rotation.
 */
async function callGemini(
  prompt: string,
  imageBase64: string
): Promise<string> {
  if (API_KEYS.length === 0) {
    throw new GeminiRateLimitError(
      "No Gemini API keys configured (GEMINI_API_KEY_1 / GEMINI_API_KEY_2 missing)."
    );
  }
  let lastErr: unknown = null;
  // Try at most API_KEYS.length keys (rotate to next on 429).
  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    const key = getNextKey();
    try {
      const text = await callWithKey(key, prompt, imageBase64);
      trackQuota();
      return text;
    } catch (err) {
      lastErr = err;
      if (err instanceof GeminiRateLimitError) throw err; // keys-missing — fatal
      if (isRateLimitError(err)) {
        // 429 from this key — try the next one.
        continue;
      }
      // Non-retryable error (network, parse, etc.) — surface immediately.
      throw err;
    }
  }
  // Exhausted all keys on 429.
  throw new GeminiRateLimitError(
    `All ${API_KEYS.length} Gemini API keys rate-limited (429). Try again later.`,
    { cause: lastErr as Error }
  );
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Analyzes a selfie for gender + liveness + reasoning. Used by the consensus
 * orchestrator on every initial verification (L3 lane).
 *
 * @param imageBase64 — JPEG image as raw base64 string (no `data:` prefix).
 * @returns {@link GeminiVerdict} with isFemale, isLive, confidence (0..1), reasoning.
 *
 * Quota impact: 1 Gemini RPD per call (effective cap 800/day across 2 keys).
 * On 429, transparently rotates to the other key and retries once.
 *
 * @throws GeminiRateLimitError — both keys 429, or no keys configured.
 * @throws GeminiParseError — Gemini response was not the expected JSON shape.
 * @throws GeminiNetworkError — 30s timeout or network failure.
 */
export async function analyzeSelfie(
  imageBase64: string
): Promise<GeminiVerdict> {
  if (!imageBase64 || imageBase64.length === 0) {
    throw new GeminiParseError("analyzeSelfie received empty imageBase64.", "");
  }

  const prompt = [
    "You are a strict identity-verification assistant for a women-only community.",
    "Analyze this photo and respond ONLY with a JSON object — no prose, no code fences.",
    "Required JSON shape:",
    '{"isFemale": boolean, "isLive": boolean, "confidence": number, "reasoning": string}',
    "",
    "Field meanings:",
    "- isFemale: true if the subject appears to be a woman (facial structure, presentation).",
    "- isLive: true if this looks like a real, freshly-captured selfie of a live person",
    "  (NOT a photo of a photo, NOT a screen-recapture, NOT an AI-generated/deepfake face).",
    "- confidence: 0..1 — how sure you are.",
    "- reasoning: ONE short sentence.",
  ].join("\n");

  const text = await callGemini(prompt, imageBase64);
  const parsed = extractJSON(text) as Partial<GeminiVerdict>;

  if (
    typeof parsed.isFemale !== "boolean" ||
    typeof parsed.isLive !== "boolean" ||
    typeof parsed.confidence !== "number" ||
    typeof parsed.reasoning !== "string"
  ) {
    throw new GeminiParseError(
      "Gemini response did not match GeminiVerdict shape.",
      text
    );
  }

  return {
    isFemale: parsed.isFemale,
    isLive: parsed.isLive,
    confidence: parsed.confidence,
    reasoning: parsed.reasoning,
  };
}

/**
 * Night-trap liveness probe. Asks Gemini only whether the face is live
 * (NOT gender). Used by the nighttime verification flow (Phase 2.6 / 2.22).
 *
 * @param imageBase64 — JPEG image as raw base64 string (no `data:` prefix).
 * @returns {@link GeminiLivenessVerdict} with isLive, confidence (0..1), reasoning.
 *
 * Quota impact: 1 Gemini RPD per call. On 429, rotates keys + retries once.
 *
 * @throws GeminiRateLimitError — both keys 429, or no keys configured.
 * @throws GeminiParseError — Gemini response was not the expected JSON shape.
 * @throws GeminiNetworkError — 30s timeout or network failure.
 */
export async function checkLiveness(
  imageBase64: string
): Promise<GeminiLivenessVerdict> {
  if (!imageBase64 || imageBase64.length === 0) {
    throw new GeminiParseError("checkLiveness received empty imageBase64.", "");
  }

  const prompt = [
    "You are a liveness-detection assistant. Look at this image and decide:",
    "is this a live human face captured in real-time, NOT a photo of a photo,",
    "NOT a screen-recapture, NOT a deepfake / AI-generated face?",
    "",
    "Respond ONLY with a JSON object — no prose, no code fences.",
    "Required JSON shape:",
    '{"isLive": boolean, "confidence": number, "reasoning": string}',
    "",
    "Field meanings:",
    "- isLive: true if the image is a live capture of a real human face.",
    "- confidence: 0..1.",
    "- reasoning: ONE short sentence.",
  ].join("\n");

  const text = await callGemini(prompt, imageBase64);
  const parsed = extractJSON(text) as Partial<GeminiLivenessVerdict>;

  if (
    typeof parsed.isLive !== "boolean" ||
    typeof parsed.confidence !== "number" ||
    typeof parsed.reasoning !== "string"
  ) {
    throw new GeminiParseError(
      "Gemini response did not match GeminiLivenessVerdict shape.",
      text
    );
  }

  return {
    isLive: parsed.isLive,
    confidence: parsed.confidence,
    reasoning: parsed.reasoning,
  };
}
