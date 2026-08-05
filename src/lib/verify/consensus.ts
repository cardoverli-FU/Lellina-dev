/**
 * Consensus Orchestrator — 3-Cloud Verification Engine for Lellina.
 *
 * Calls L2 (HuggingFace gender) + L3 (Gemini gender+liveness) in parallel
 * via Promise.allSettled. Calls L4 (Sightengine fraud/integrity) ONLY on
 * L2/L3 disagreement or borderline — saves Sightengine quota (real usage
 * ~10-60/day vs the 400/day 80% cap).
 *
 * Decision matrix (per Phase 2 Refined Architecture section A):
 *
 *   L2 female (>=0.7) + L3 female (>=0.7) + L3 isLive   → PASS (skip L4)
 *   L2 male   (>=0.7) + L3 male   (>=0.7)               → BAN  (skip L4)
 *   Disagree OR either confidence < 0.7                  → call L4
 *       L4 fraud (aiScore>=0.5) / offensive / no-face    → MANUAL_REVIEW
 *       L4 clean + hasFace + L2/L3 agree on gender
 *           + at least one confidence >= 0.7             → majority verdict
 *       otherwise                                        → MANUAL_REVIEW
 *   L2 fails, L3 succeeds: L3 conf >= 0.85 + isLive      → PASS, else MANUAL_REVIEW
 *   L3 fails, L2 succeeds: L2 conf >= 0.85 + female      → PASS, else MANUAL_REVIEW
 *   Both fail                                            → ConsensusError (caller → 503)
 *
 * Zero-storage enforcement: this function takes base64 strings, returns
 * verdicts, and NEVER writes anything to disk, DB, or log. The caller
 * (API route) is responsible for persistence of verdict-only (no media).
 */

import {
  classifyGender,
  HFRateLimitError,
  HFImageTooLargeError,
  HFModelLoadingError,
  HFNetworkError,
  type HFGenderResult,
} from "./huggingface";
import {
  analyzeSelfie,
  GeminiRateLimitError,
  GeminiParseError,
  GeminiNetworkError,
  type GeminiVerdict,
} from "./gemini";
import {
  checkImageIntegrity,
  SightengineRateLimitError,
  SightengineNetworkError,
  type SightengineResult,
} from "./sightengine";

// ─── Types ───────────────────────────────────────────────────────────

export type ConsensusVerdictLabel = "PASS" | "BAN" | "MANUAL_REVIEW";

/**
 * Final consensus verdict returned to the API route. Matches the exact shape
 * mandated by the Phase 2 architecture (no extra fields — caller persists
 * verdict-only, no media).
 */
export interface ConsensusVerdict {
  verdict: ConsensusVerdictLabel;
  scores: {
    hf?: { label: "female" | "male"; confidence: number };
    gemini?: {
      isFemale: boolean;
      isLive: boolean;
      confidence: number;
      reasoning: string;
    };
    sightengine?: {
      isAIGenerated: boolean;
      aiScore: number;
      hasFace: boolean;
    };
  };
  /** Human-readable explanation of how the verdict was reached. */
  reasoning: string;
}

/**
 * Thrown when BOTH L2 and L3 fail (rate limits, network, etc.). The caller
 * (API route) should return HTTP 503 "Verification services temporarily
 * unavailable." to the user. Carries the underlying errors for the API
 * route's audit log (verdict-only — never the image data).
 */
export class ConsensusError extends Error {
  public readonly hfError?: Error;
  public readonly geminiError?: Error;
  constructor(
    message: string,
    opts: { hfError?: Error; geminiError?: Error } = {}
  ) {
    super(message);
    this.name = "ConsensusError";
    this.hfError = opts.hfError;
    this.geminiError = opts.geminiError;
    Object.setPrototypeOf(this, ConsensusError.prototype);
  }
}

// ─── Internal constants ──────────────────────────────────────────────

/** Minimum confidence for L2/L3 to count toward a unanimous PASS or BAN. */
const CONF_PASS_CONFIDENCE = 0.7;

/** Minimum confidence required when only one cloud is available (fallback). */
const CONF_FALLBACK_CONFIDENCE = 0.85;

/** Sightengine AI-generated-content threshold for MANUAL_REVIEW escalation. */
const SIGHTENGINE_AI_THRESHOLD = 0.5;

// ─── Internal helpers ────────────────────────────────────────────────

/**
 * Builds a {@link ConsensusVerdict} with the per-cloud score fields populated
 * only for clouds that actually ran. Centralizes the score-shape mapping so
 * the consensus logic stays readable.
 */
function buildVerdict(
  verdict: ConsensusVerdictLabel,
  reasoning: string,
  opts: {
    hf?: HFGenderResult;
    gemini?: GeminiVerdict;
    sightengine?: SightengineResult;
  } = {}
): ConsensusVerdict {
  return {
    verdict,
    reasoning,
    scores: {
      hf: opts.hf
        ? { label: opts.hf.label, confidence: opts.hf.confidence }
        : undefined,
      gemini: opts.gemini
        ? {
            isFemale: opts.gemini.isFemale,
            isLive: opts.gemini.isLive,
            confidence: opts.gemini.confidence,
            reasoning: opts.gemini.reasoning,
          }
        : undefined,
      sightengine: opts.sightengine
        ? {
            isAIGenerated: opts.sightengine.isAIGenerated,
            aiScore: opts.sightengine.aiScore,
            hasFace: opts.sightengine.hasFace,
          }
        : undefined,
    },
  };
}

function fmt(n: number): string {
  return n.toFixed(2);
}

function errName(err: unknown): string {
  if (err instanceof Error) return err.name;
  return "error";
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Runs the 3-cloud consensus verification on a selfie. This is the entry
 * point called by `/api/verify/analyze` (Phase 2.5).
 *
 * @param selfieBase64 — JPEG image as raw base64 (no `data:` prefix).
 * @returns {@link ConsensusVerdict} with verdict label + per-cloud scores + reasoning.
 * @throws ConsensusError when BOTH L2 and L3 fail — caller should return HTTP 503.
 *
 * Quota impact:
 *   - Always: 1 HF call + 1 Gemini call (in parallel via Promise.allSettled).
 *   - On disagreement/borderline: +1 Sightengine call (rare — ~10-60/day).
 *
 * Zero-storage: this function does NOT write to disk, DB, or log. The caller
 * persists verdict-only (no media) to the VerificationAttempt record.
 */
export async function runConsensus(
  selfieBase64: string
): Promise<ConsensusVerdict> {
  if (!selfieBase64 || selfieBase64.length === 0) {
    throw new ConsensusError("runConsensus received empty selfieBase64.");
  }

  // Fire L2 + L3 in parallel. allSettled so we can branch on partial failure
  // without one cloud's rejection short-circuiting the other.
  const [hfSettled, geminiSettled] = await Promise.allSettled([
    classifyGender(selfieBase64),
    analyzeSelfie(selfieBase64),
  ]);

  const hfOK = hfSettled.status === "fulfilled";
  const geminiOK = geminiSettled.status === "fulfilled";

  // ─── Case 5: both clouds failed → caller returns 503. ──────────────
  if (!hfOK && !geminiOK) {
    const hfErr =
      hfSettled.status === "rejected"
        ? (hfSettled.reason as Error)
        : undefined;
    const geminiErr =
      geminiSettled.status === "rejected"
        ? (geminiSettled.reason as Error)
        : undefined;
    throw new ConsensusError(
      "Both L2 (HuggingFace) and L3 (Gemini) failed — verification services unavailable.",
      { hfError: hfErr, geminiError: geminiErr }
    );
  }

  // ─── Case 3: L2 failed, L3 succeeded — require high L3 confidence. ─
  if (!hfOK && geminiOK) {
    const gemini =
      geminiSettled.status === "fulfilled" ? geminiSettled.value : undefined;
    if (!gemini) {
      throw new ConsensusError("Gemini result unexpectedly missing.");
    }
    const hfErr =
      hfSettled.status === "rejected"
        ? (hfSettled.reason as Error)
        : undefined;
    if (
      gemini.isFemale &&
      gemini.isLive &&
      gemini.confidence >= CONF_FALLBACK_CONFIDENCE
    ) {
      return buildVerdict(
        "PASS",
        `L2 unavailable (${errName(hfErr)}); L3 Gemini alone PASS at confidence ${fmt(gemini.confidence)} (>=${CONF_FALLBACK_CONFIDENCE}) with isLive=true.`,
        { gemini }
      );
    }
    return buildVerdict(
      "MANUAL_REVIEW",
      `L2 unavailable (${errName(hfErr)}); L3 Gemini confidence ${fmt(gemini.confidence)} < ${CONF_FALLBACK_CONFIDENCE} or did not pass female+live — manual review required.`,
      { gemini }
    );
  }

  // ─── Case 4: L3 failed, L2 succeeded — require high L2 confidence. ─
  if (hfOK && !geminiOK) {
    const hf = hfSettled.status === "fulfilled" ? hfSettled.value : undefined;
    if (!hf) {
      throw new ConsensusError("HF result unexpectedly missing.");
    }
    const geminiErr =
      geminiSettled.status === "rejected"
        ? (geminiSettled.reason as Error)
        : undefined;
    if (hf.label === "female" && hf.confidence >= CONF_FALLBACK_CONFIDENCE) {
      return buildVerdict(
        "PASS",
        `L3 unavailable (${errName(geminiErr)}); L2 HF alone PASS at confidence ${fmt(hf.confidence)} (>=${CONF_FALLBACK_CONFIDENCE}).`,
        { hf }
      );
    }
    return buildVerdict(
      "MANUAL_REVIEW",
      `L3 unavailable (${errName(geminiErr)}); L2 HF label=${hf.label} confidence ${fmt(hf.confidence)} — manual review required.`,
      { hf }
    );
  }

  // ─── Cases 1 & 2: both succeeded. ─────────────────────────────────
  const hf = hfSettled.status === "fulfilled" ? hfSettled.value : undefined;
  const gemini =
    geminiSettled.status === "fulfilled" ? geminiSettled.value : undefined;
  if (!hf || !gemini) {
    throw new ConsensusError(
      "Unexpected missing result despite both clouds reporting OK."
    );
  }

  const hfFemale = hf.label === "female";
  const hfConfident = hf.confidence >= CONF_PASS_CONFIDENCE;
  const gemFemale = gemini.isFemale;
  const gemConfident = gemini.confidence >= CONF_PASS_CONFIDENCE;

  // Case 1: both confidently female AND Gemini confirms liveness → PASS.
  // Skip L4 to save Sightengine quota (unanimous female consensus).
  if (hfFemale && gemFemale && hfConfident && gemConfident && gemini.isLive) {
    return buildVerdict(
      "PASS",
      `L2 (female ${fmt(hf.confidence)}) + L3 (female ${fmt(gemini.confidence)}, live=true) — unanimous female consensus. L4 skipped (quota saving).`,
      { hf, gemini }
    );
  }

  // Case 2: both confidently male → BAN. Skip L4.
  if (!hfFemale && !gemFemale && hfConfident && gemConfident) {
    return buildVerdict(
      "BAN",
      `L2 (male ${fmt(hf.confidence)}) + L3 (male ${fmt(gemini.confidence)}) — unanimous male consensus. Ban + device fingerprint + IP.`,
      { hf, gemini }
    );
  }

  // Case 3 (within both-succeeded branch): disagree OR confidence < 0.7
  // → call L4 Sightengine for fraud/integrity tiebreaker.
  let sightengine: SightengineResult;
  try {
    sightengine = await checkImageIntegrity(selfieBase64);
  } catch (err) {
    // L4 unavailable — cannot arbitrate. MANUAL_REVIEW for safety.
    return buildVerdict(
      "MANUAL_REVIEW",
      `L4 Sightengine failed (${errName(err)}); L2/L3 borderline (L2=${hf.label}:${fmt(hf.confidence)}, L3=${gemini.isFemale ? "female" : "male"}:${fmt(gemini.confidence)}). Manual review required.`,
      { hf, gemini }
    );
  }

  // L4 fraud flag → MANUAL_REVIEW (do NOT pass potential AI-gen / offensive / no-face).
  if (
    sightengine.isAIGenerated &&
    sightengine.aiScore >= SIGHTENGINE_AI_THRESHOLD
  ) {
    return buildVerdict(
      "MANUAL_REVIEW",
      `L4 flagged AI-generated content (aiScore=${fmt(sightengine.aiScore)} >= ${SIGHTENGINE_AI_THRESHOLD}). Manual review required.`,
      { hf, gemini, sightengine }
    );
  }
  if (sightengine.isOffensive) {
    return buildVerdict(
      "MANUAL_REVIEW",
      `L4 flagged offensive content (score=${fmt(sightengine.offensiveScore)}). Manual review required.`,
      { hf, gemini, sightengine }
    );
  }
  if (!sightengine.hasFace) {
    return buildVerdict(
      "MANUAL_REVIEW",
      `L4 detected no face in image. Manual review required.`,
      { hf, gemini, sightengine }
    );
  }

  // L4 clean + hasFace → lean toward the majority.
  // "Majority" here means L2 and L3 agree on gender (even if at borderline
  // confidence). For genuine L2/L3 disagreement (1v1), there is no majority —
  // route to MANUAL_REVIEW for safety.
  if (hfFemale === gemFemale) {
    // L2 and L3 agree on gender — confidence was just borderline (<0.7 on one).
    // Require at least one cloud at >=0.7 to commit to that gender.
    if (Math.max(hf.confidence, gemini.confidence) >= CONF_PASS_CONFIDENCE) {
      if (hfFemale) {
        return buildVerdict(
          "PASS",
          `L2/L3 agree on female (borderline confidence — L2:${fmt(hf.confidence)} L3:${fmt(gemini.confidence)}). L4 clean (aiScore=${fmt(sightengine.aiScore)}, hasFace=true). Lean toward female majority.`,
          { hf, gemini, sightengine }
        );
      }
      return buildVerdict(
        "BAN",
        `L2/L3 agree on male (borderline confidence — L2:${fmt(hf.confidence)} L3:${fmt(gemini.confidence)}). L4 clean + face present. Lean toward male majority.`,
        { hf, gemini, sightengine }
      );
    }
  }

  // Genuine L2/L3 disagreement, OR both clouds below 0.7 confidence.
  // Safest outcome = MANUAL_REVIEW (admin sees the per-cloud scores + L4 result).
  return buildVerdict(
    "MANUAL_REVIEW",
    `L2=${hf.label}:${fmt(hf.confidence)}, L3=${gemini.isFemale ? "female" : "male"}:${fmt(gemini.confidence)} — clouds disagree or low-confidence. L4 clean (aiScore=${fmt(sightengine.aiScore)}, hasFace=${sightengine.hasFace}). Manual review required.`,
    { hf, gemini, sightengine }
  );
}

// Re-export the per-cloud error classes so API routes can branch on
// specific failure modes (e.g. HFImageTooLargeError → 422 to the client).
export {
  HFRateLimitError,
  HFImageTooLargeError,
  HFModelLoadingError,
  HFNetworkError,
} from "./huggingface";
export {
  GeminiRateLimitError,
  GeminiParseError,
  GeminiNetworkError,
} from "./gemini";
export {
  SightengineRateLimitError,
  SightengineNetworkError,
} from "./sightengine";
