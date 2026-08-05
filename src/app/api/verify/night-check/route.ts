// ════════════════════════════════════════════════════════════════════
//  Lellina — Night Check API (Phase 2.6)
//  Image-only re-verification. Cosine match + Gemini liveness.
//  Fires on login during 21:00–07:00 SAST (40% trigger, 24h cooldown).
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { db } from '@/lib/db'
import {
  shouldTriggerNightTrap,
  evaluateNightCheck,
  markNightCheckComplete,
} from '@/lib/nighttime-trap'
import { checkLiveness } from '@/lib/verify/gemini'

export async function POST(req: NextRequest) {
  let freshEmbeddingBase64: string | undefined

  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ─── Check if trap should trigger ───────────────────────────
    const trap = shouldTriggerNightTrap(user.lastNightCheck)
    if (!trap.shouldTrigger) {
      return NextResponse.json({
        trigger: false,
        reason: trap.reason,
        hourSAST: trap.hourSAST,
      })
    }

    // ─── Get fresh embedding from client ────────────────────────
    const body = await req.json()
    const { freshEmbedding, selfieBase64 } = body

    freshEmbeddingBase64 = selfieBase64

    if (!freshEmbedding || !Array.isArray(freshEmbedding) || freshEmbedding.length !== 128) {
      return NextResponse.json(
        { error: 'Invalid embedding. Expected 128-dim array.' },
        { status: 400 }
      )
    }

    // ─── Get stored embedding ───────────────────────────────────
    if (!user.faceEmbedding) {
      // No reference embedding — can't do night check. Let user in, flag for admin.
      await markNightCheckComplete(user.id)
      return NextResponse.json({
        trigger: true,
        verdict: 'PASS',
        reason: 'No reference embedding — admin review recommended',
        cosineScore: null,
      })
    }

    let storedEmbedding: number[]
    try {
      storedEmbedding = JSON.parse(user.faceEmbedding)
    } catch {
      await markNightCheckComplete(user.id)
      return NextResponse.json({
        trigger: true,
        verdict: 'PASS',
        reason: 'Reference embedding corrupted — admin review recommended',
        cosineScore: null,
      })
    }

    // ─── Evaluate cosine similarity ─────────────────────────────
    const result = evaluateNightCheck(freshEmbedding, storedEmbedding)

    // ─── BORDERLINE: Gemini liveness second opinion ─────────────
    if (result.verdict === 'BORDERLINE' && selfieBase64) {
      const base64Data = selfieBase64.replace(/^data:image\/\w+;base64,/, '')
      const liveness = await checkLiveness(base64Data)

      if (!liveness.isLive && liveness.confidence > 0.6) {
        // Gemini says NOT live (photo/screen/deepfake) → block
        await markNightCheckComplete(user.id)
        return NextResponse.json({
          trigger: true,
          verdict: 'BLOCK',
          reason: `Borderline cosine (${result.cosineScore.toFixed(3)}) + Gemini liveness failed (${liveness.confidence}): ${liveness.reasoning}`,
          cosineScore: result.cosineScore,
          liveness,
        })
      }

      // Gemini says live → pass the borderline
      await markNightCheckComplete(user.id)
      return NextResponse.json({
        trigger: true,
        verdict: 'PASS',
        reason: `Borderline cosine (${result.cosineScore.toFixed(3)}) but Gemini liveness passed (${liveness.confidence})`,
        cosineScore: result.cosineScore,
        liveness,
      })
    }

    // ─── PASS or BLOCK ──────────────────────────────────────────
    await markNightCheckComplete(user.id)

    // For PASS with high confidence, also do a Gemini liveness check
    // (per Planning Session 3: Gemini liveness on EVERY night check for 90%+ target)
    if (result.verdict === 'PASS' && selfieBase64) {
      try {
        const base64Data = selfieBase64.replace(/^data:image\/\w+;base64,/, '')
        const liveness = await checkLiveness(base64Data)
        if (!liveness.isLive && liveness.confidence > 0.7) {
          // Cosine passed but Gemini says not live → block
          return NextResponse.json({
            trigger: true,
            verdict: 'BLOCK',
            reason: `Cosine pass (${result.cosineScore.toFixed(3)}) but Gemini liveness failed: ${liveness.reasoning}`,
            cosineScore: result.cosineScore,
            liveness,
          })
        }
        return NextResponse.json({
          trigger: true,
          verdict: 'PASS',
          reason: result.reason + ` + Gemini liveness OK (${liveness.confidence})`,
          cosineScore: result.cosineScore,
          liveness,
        })
      } catch (livenessError) {
        // Liveness check failed (quota/network) — allow pass on cosine alone
        console.error('[night-check] Liveness error:', livenessError)
        return NextResponse.json({
          trigger: true,
          verdict: 'PASS',
          reason: result.reason + ' (liveness check skipped — service unavailable)',
          cosineScore: result.cosineScore,
        })
      }
    }

    return NextResponse.json({
      trigger: true,
      verdict: result.verdict,
      reason: result.reason,
      cosineScore: result.cosineScore,
    })

  } catch (error) {
    console.error('[night-check] Error:', error)
    freshEmbeddingBase64 = undefined // zero-storage
    const message = error instanceof Error ? error.message : 'Night check failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─── GET: Check if trap should trigger (for client-side pre-check) ──
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Admin bypasses night trap
  if (user.role === 'ADMIN') {
    return NextResponse.json({ trigger: false, reason: 'Admin bypass' })
  }

  const trap = shouldTriggerNightTrap(user.lastNightCheck)
  return NextResponse.json({
    trigger: trap.shouldTrigger,
    reason: trap.reason,
    hourSAST: trap.hourSAST,
  })
}
