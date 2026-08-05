/**
 * Lellina 3-Cloud Consensus Verification Library
 *
 * Public surface for the Phase 2 verification gate (3-cloud consensus engine).
 *
 *   L1 (browser, modern-face-api)     — NOT in this package (client-side).
 *   L2 (HuggingFace gender)           — ./huggingface.ts
 *   L3 (Gemini gender+liveness)       — ./gemini.ts
 *   L4 (Sightengine fraud/integrity)  — ./sightengine.ts
 *   Consensus orchestrator            — ./consensus.ts
 *
 * Import pattern from API routes:
 *   import {
 *     runConsensus,
 *     ConsensusError,
 *     wakeModel,
 *     type ConsensusVerdict,
 *   } from "@/lib/verify";
 *
 * Zero-storage policy: none of these functions write media to disk, DB, or log.
 * Only verdict labels, per-cloud scores, and timing metadata may be persisted
 * by the caller (the /api/verify/* routes).
 */

// ─── L3: Gemini ──────────────────────────────────────────────────────
export {
  analyzeSelfie,
  checkLiveness,
  getGeminiQuotaUsage,
  GeminiRateLimitError,
  GeminiParseError,
  GeminiNetworkError,
  type GeminiVerdict,
  type GeminiLivenessVerdict,
} from "./gemini";

// ─── L2: HuggingFace ─────────────────────────────────────────────────
export {
  classifyGender,
  wakeModel,
  HFRateLimitError,
  HFImageTooLargeError,
  HFModelLoadingError,
  HFNetworkError,
  type HFGenderResult,
} from "./huggingface";

// ─── L4: Sightengine ─────────────────────────────────────────────────
export {
  checkImageIntegrity,
  SightengineRateLimitError,
  SightengineNetworkError,
  type SightengineResult,
} from "./sightengine";

// ─── Orchestrator ────────────────────────────────────────────────────
export {
  runConsensus,
  ConsensusError,
  type ConsensusVerdict,
  type ConsensusVerdictLabel,
} from "./consensus";
