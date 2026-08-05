// ════════════════════════════════════════════════════════════════════
//  Lellina — Verification Token API
//  Validates the token issued on PASS. Used by /register.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token required' },
        { status: 400 }
      )
    }

    const record = await db.verificationToken.findUnique({
      where: { token },
    })

    if (!record || record.used || record.expiresAt < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'Token invalid or expired' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      deviceFingerprint: record.deviceFingerprint,
      attemptId: record.attemptId,
    })

  } catch (error) {
    console.error('[verify/token] Error:', error)
    return NextResponse.json(
      { valid: false, error: 'Token validation failed' },
      { status: 500 }
    )
  }
}

// Consume the token (mark as used) — called after registration completes
export async function PATCH(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token required' },
        { status: 400 }
      )
    }

    await db.verificationToken.updateMany({
      where: { token },
      data: { used: true },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[verify/token PATCH] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to consume token' },
      { status: 500 }
    )
  }
}
