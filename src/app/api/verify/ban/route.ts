// ════════════════════════════════════════════════════════════════════
//  Lellina — Verify Ban API (Phase 2.8)
//  Device + IP ban. Called when verification fails repeatedly.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { deviceFingerprint, userId, reason } = body

    if (!deviceFingerprint) {
      return NextResponse.json(
        { error: 'Device fingerprint required' },
        { status: 400 }
      )
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'

    // Ban the user if provided
    if (userId) {
      await db.user.update({
        where: { id: userId },
        data: {
          bannedAt: new Date(),
          banReason: reason || 'Verification failure',
          deviceFingerprint,
        },
      })
    }

    // Log the ban as an admin audit entry (system action)
    await db.verificationAttempt.updateMany({
      where: { deviceFingerprint, verdict: 'BAN' },
      data: { failed: true },
    })

    return NextResponse.json({
      success: true,
      message: 'Device banned',
    })

  } catch (error) {
    console.error('[verify/ban] Error:', error)
    return NextResponse.json(
      { error: 'Ban failed' },
      { status: 500 }
    )
  }
}
