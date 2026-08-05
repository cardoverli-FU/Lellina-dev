// ════════════════════════════════════════════════════════════════════
//  Lellina — Verification Limits (Phase 2.9)
//  3 attempts per device. 1 per hour rate-limit.
// ════════════════════════════════════════════════════════════════════

import { db } from '@/lib/db'

const MAX_ATTEMPTS_PER_DEVICE = 3
const HOUR_COOLDOWN_MS = 60 * 60 * 1000

export interface VerifyLimitResult {
  allowed: boolean
  reason?: string
  attemptsRemaining: number
  nextAttemptAt?: Date
}

export async function checkVerifyLimits(deviceFingerprint: string): Promise<VerifyLimitResult> {
  // Count attempts in the last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * HOUR_COOLDOWN_MS)

  const recentAttempts = await db.verificationAttempt.findMany({
    where: {
      deviceFingerprint,
      createdAt: { gte: twentyFourHoursAgo },
    },
    orderBy: { createdAt: 'desc' },
  })

  const failedAttempts = recentAttempts.filter((a) => a.failed)

  // Max 3 failed attempts per device per 24h
  if (failedAttempts.length >= MAX_ATTEMPTS_PER_DEVICE) {
    const lastAttempt = failedAttempts[0]
    const nextAttemptAt = new Date(lastAttempt.createdAt.getTime() + 24 * HOUR_COOLDOWN_MS)
    return {
      allowed: false,
      reason: 'MAX_ATTEMPTS_EXCEEDED',
      attemptsRemaining: 0,
      nextAttemptAt,
    }
  }

  // 1 attempt per hour rate-limit
  const oneHourAgo = new Date(Date.now() - HOUR_COOLDOWN_MS)
  const recentInLastHour = recentAttempts.find((a) => a.createdAt > oneHourAgo)

  if (recentInLastHour) {
    const nextAttemptAt = new Date(recentInLastHour.createdAt.getTime() + HOUR_COOLDOWN_MS)
    return {
      allowed: false,
      reason: 'HOURLY_COOLDOWN',
      attemptsRemaining: MAX_ATTEMPTS_PER_DEVICE - failedAttempts.length,
      nextAttemptAt,
    }
  }

  return {
    allowed: true,
    attemptsRemaining: MAX_ATTEMPTS_PER_DEVICE - failedAttempts.length,
  }
}

export async function recordVerifyAttempt(data: {
  deviceFingerprint: string
  ipAddress: string
  userId?: string
  attemptId?: string
}): Promise<string> {
  const attempt = await db.verificationAttempt.create({
    data: {
      deviceFingerprint: data.deviceFingerprint,
      ipAddress: data.ipAddress,
      userId: data.userId || null,
    },
  })
  return attempt.id
}

export async function updateVerifyAttempt(
  attemptId: string,
  data: {
    verdict?: string
    cloudScores?: string
    stepSelfie?: boolean
    stepVoice?: boolean
    stepVideo?: boolean
    stepConsensus?: boolean
    voicePitchHz?: number
    videoCodeMatch?: boolean
    failed?: boolean
    failReason?: string
  }
) {
  await db.verificationAttempt.update({
    where: { id: attemptId },
    data,
  })
}
