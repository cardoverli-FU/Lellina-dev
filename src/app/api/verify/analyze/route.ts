// ════════════════════════════════════════════════════════════════════
//  Lellina — Verify Analyze API (Phase 2.5)
//  Orchestrates the 3-cloud consensus on the final selfie.
//  ZERO STORAGE: image data is in-memory only, never persisted.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { runConsensus } from '@/lib/verify/consensus'
import { checkVerifyLimits, recordVerifyAttempt, updateVerifyAttempt } from '@/lib/verify-limits'
import { db } from '@/lib/db'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  let attemptId: string | null = null
  let selfieBase64: string | undefined
  let deviceFingerprint: string | undefined

  try {
    const body = await req.json()
    const {
      selfieBase64: sb,
      deviceFingerprint: df,
      voicePitchHz,
      videoCodeMatch,
      expectedCode,
      attemptId: clientAttemptId,
    } = body

    selfieBase64 = sb
    deviceFingerprint = df

    // ─── Validation ─────────────────────────────────────────────
    if (!selfieBase64 || !deviceFingerprint) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Strip data: prefix if present
    const base64Data = selfieBase64.replace(/^data:image\/\w+;base64,/, '')

    // Size check (max ~4MB for Gemini, 2MB for HF)
    const sizeBytes = Buffer.from(base64Data, 'base64').length
    if (sizeBytes > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image too large. Max 4MB.' },
        { status: 400 }
      )
    }

    // ─── Rate-limit check ───────────────────────────────────────
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const limitCheck = await checkVerifyLimits(deviceFingerprint)
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: limitCheck.reason,
          attemptsRemaining: limitCheck.attemptsRemaining,
          nextAttemptAt: limitCheck.nextAttemptAt,
        },
        { status: 429 }
      )
    }

    // ─── Record attempt ─────────────────────────────────────────
    attemptId = clientAttemptId || await recordVerifyAttempt({
      deviceFingerprint,
      ipAddress,
    })

    // ─── Run 3-cloud consensus ──────────────────────────────────
    const consensus = await runConsensus(base64Data)

    // ─── Update attempt record ──────────────────────────────────
    const failed = consensus.verdict === 'BAN'
    await updateVerifyAttempt(attemptId, {
      verdict: consensus.verdict,
      cloudScores: JSON.stringify(consensus.scores),
      stepSelfie: true,
      stepVoice: voicePitchHz !== undefined,
      stepVideo: videoCodeMatch !== undefined,
      stepConsensus: true,
      voicePitchHz,
      videoCodeMatch,
      failed,
      failReason: failed ? consensus.reasoning : null,
    })

    // ─── Issue token on PASS (for /register) ────────────────────
    if (consensus.verdict === 'PASS') {
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min

      await db.verificationToken.create({
        data: {
          token,
          deviceFingerprint,
          ipAddress,
          attemptId,
          expiresAt,
        },
      })

      return NextResponse.json({
        verdict: 'PASS',
        verificationToken: token,
        reasoning: consensus.reasoning,
        scores: consensus.scores,
      })
    }

    // ─── Ban on BAN verdict ─────────────────────────────────────
    if (consensus.verdict === 'BAN') {
      // We don't ban the device immediately on a single BAN — we let
      // the attempt limit system handle it (3 fails = blocked).
      // But we log it for admin visibility.
      return NextResponse.json({
        verdict: 'BAN',
        reasoning: consensus.reasoning,
        scores: consensus.scores,
      })
    }

    // ─── Manual review ──────────────────────────────────────────
    return NextResponse.json({
      verdict: 'MANUAL_REVIEW',
      reasoning: consensus.reasoning,
      scores: consensus.scores,
    })

  } catch (error) {
    console.error('[verify/analyze] Error:', error)

    // Update attempt as failed if we have an ID
    if (attemptId) {
      await updateVerifyAttempt(attemptId, {
        verdict: 'ERROR',
        failed: true,
        failReason: error instanceof Error ? error.message : 'Unknown error',
      }).catch(() => {})
    }

    // Clean up memory references (zero-storage enforcement)
    selfieBase64 = undefined
    deviceFingerprint = undefined

    const message = error instanceof Error ? error.message : 'Verification failed'
    const status = message.includes('Rate') || message.includes('429') ? 503 : 500

    return NextResponse.json(
      { error: message },
      { status }
    )
  }
}
