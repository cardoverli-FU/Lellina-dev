// ════════════════════════════════════════════════════════════════════
//  Lellina — Nighttime Trap (Phase 2.6)
//  21:00–07:00 SAST. Image-only re-verification on login.
//  Cosine match + Gemini liveness. No voice/video at night.
// ════════════════════════════════════════════════════════════════════

import { db } from '@/lib/db'

// SAST = UTC+2
const SAST_OFFSET = 2

const NIGHT_START_HOUR = 21 // 21:00
const NIGHT_END_HOUR = 7 // 07:00
const COOLDOWN_HOURS = 24
const TRIGGER_PROBABILITY = 0.4 // 40% trigger rate

// Cosine similarity threshold for face embedding match
const COSINE_PASS = 0.6 // ≥0.6 = same person (pass)
const COSINE_BLOCK = 0.5 // <0.5 = different person (block)

export interface NightTrapContext {
  shouldTrigger: boolean
  reason: string
  hourSAST: number
}

/**
 * Check if the nighttime trap should trigger for a user on login.
 * Conditions:
 * 1. Current SAST time is 21:00–07:00 (10-hour window)
 * 2. User hasn't been night-checked in the last 24 hours
 * 3. Random roll < 0.4 (40% trigger rate)
 */
export function shouldTriggerNightTrap(lastNightCheck: Date | null): NightTrapContext {
  const now = new Date()
  const sastTime = new Date(now.getTime() + SAST_OFFSET * 60 * 60 * 1000)
  const hourSAST = sastTime.getUTCHours()

  // Check if within 21:00–07:00 window
  // 21, 22, 23, 0, 1, 2, 3, 4, 5, 6 = night (10 hours)
  const isNightTime = hourSAST >= NIGHT_START_HOUR || hourSAST < NIGHT_END_HOUR

  if (!isNightTime) {
    return { shouldTrigger: false, reason: 'NOT_NIGHT_HOURS', hourSAST }
  }

  // Check 24h cooldown
  if (lastNightCheck) {
    const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000
    const timeSinceLastCheck = now.getTime() - lastNightCheck.getTime()
    if (timeSinceLastCheck < cooldownMs) {
      return { shouldTrigger: false, reason: 'COOLDOWN_ACTIVE', hourSAST }
    }
  }

  // 40% trigger probability
  const roll = Math.random()
  if (roll >= TRIGGER_PROBABILITY) {
    return { shouldTrigger: false, reason: 'ROLL_SKIPPED', hourSAST }
  }

  return { shouldTrigger: true, reason: 'TRIGGERED', hourSAST }
}

/**
 * Compute cosine similarity between two 128-dim face embeddings.
 * Returns value in [-1, 1]. Higher = more similar.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  if (denom === 0) return 0

  return dotProduct / denom
}

export interface NightCheckResult {
  verdict: 'PASS' | 'BLOCK' | 'BORDERLINE'
  cosineScore: number
  reason: string
}

/**
 * Evaluate a night-check using cosine similarity.
 * The caller is responsible for:
 * - Computing the fresh embedding (client-side, modern-face-api)
 * - Calling Gemini liveness check if verdict is BORDERLINE
 *
 * Thresholds:
 * - ≥0.6 → PASS (instant, no cloud call needed)
 * - <0.5 → BLOCK (different person)
 * - 0.5–0.6 → BORDERLINE (caller must call Gemini liveness for second opinion)
 */
export function evaluateNightCheck(
  freshEmbedding: number[],
  storedEmbedding: number[]
): NightCheckResult {
  const score = cosineSimilarity(freshEmbedding, storedEmbedding)

  if (score >= COSINE_PASS) {
    return {
      verdict: 'PASS',
      cosineScore: score,
      reason: `Cosine ${score.toFixed(3)} ≥ ${COSINE_PASS} — same face confirmed`,
    }
  }

  if (score < COSINE_BLOCK) {
    return {
      verdict: 'BLOCK',
      cosineScore: score,
      reason: `Cosine ${score.toFixed(3)} < ${COSINE_BLOCK} — different person detected`,
    }
  }

  return {
    verdict: 'BORDERLINE',
    cosineScore: score,
    reason: `Cosine ${score.toFixed(3)} in borderline range [${COSINE_BLOCK}, ${COSINE_PASS}) — requires Gemini liveness second opinion`,
  }
}

/**
 * Update the user's lastNightCheck timestamp.
 */
export async function markNightCheckComplete(userId: string) {
  await db.user.update({
    where: { id: userId },
    data: { lastNightCheck: new Date() },
  })
}

/**
 * Check if current time is within the night window (for UI display).
 */
export function isCurrentlyNightTime(): boolean {
  const now = new Date()
  const sastTime = new Date(now.getTime() + SAST_OFFSET * 60 * 60 * 1000)
  const hourSAST = sastTime.getUTCHours()
  return hourSAST >= NIGHT_START_HOUR || hourSAST < NIGHT_END_HOUR
}

/**
 * Get current SAST hour (for display/debugging).
 */
export function getCurrentSASTHour(): number {
  const now = new Date()
  const sastTime = new Date(now.getTime() + SAST_OFFSET * 60 * 60 * 1000)
  return sastTime.getUTCHours()
}
