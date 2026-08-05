// ════════════════════════════════════════════════════════════════════
//  Lellina — HF Wake Ping API (Phase 2, cold-start killer)
//  Fires when user enters /verify. Triggers HuggingFace model load.
//  By the time the user reaches the selfie step, model is warm.
// ════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { wakeModel } from '@/lib/verify/huggingface'

export async function POST() {
  try {
    const woken = await wakeModel()
    return NextResponse.json({
      success: true,
      woken,
      message: woken ? 'Model warm or waking' : 'Wake ping failed — will retry on capture',
    })
  } catch (error) {
    console.error('[verify/wake] Error:', error)
    // Non-blocking — the verify flow will handle HF being cold
    return NextResponse.json({
      success: false,
      woken: false,
      message: 'Wake ping failed — verification will handle cold start',
    })
  }
}
