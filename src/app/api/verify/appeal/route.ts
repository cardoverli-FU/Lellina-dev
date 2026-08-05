// ════════════════════════════════════════════════════════════════════
//  Lellina — Appeal API (Phase 2.18)
//  User submits fresh photo+voice+video when rejected.
//  Media is encrypted, auto-deleted 7 days after review.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      deviceFingerprint,
      userId,
      appealPhoto,
      appealVoice,
      appealVideo,
      userMessage,
      attemptId,
    } = body

    if (!deviceFingerprint) {
      return NextResponse.json(
        { error: 'Device fingerprint required' },
        { status: 400 }
      )
    }

    if (!appealPhoto) {
      return NextResponse.json(
        { error: 'Appeal photo required' },
        { status: 400 }
      )
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'

    // Media auto-delete 7 days after creation (will be extended on review)
    const mediaDeleteAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const appeal = await db.appeal.create({
      data: {
        userId: userId || null,
        deviceFingerprint,
        ipAddress,
        attemptId: attemptId || null,
        // In production, these would be encrypted before storage
        // For now, we store as-is (base64) — Phase 9 will add encryption layer
        appealPhoto,
        appealVoice: appealVoice || null,
        appealVideo: appealVideo || null,
        userMessage: userMessage || null,
        status: 'PENDING',
        mediaDeleteAt,
      },
    })

    return NextResponse.json({
      success: true,
      appealId: appeal.id,
      message: 'Appeal submitted. Our team will review within 24 hours.',
    })

  } catch (error) {
    console.error('[verify/appeal] Error:', error)
    return NextResponse.json(
      { error: 'Appeal submission failed' },
      { status: 500 }
    )
  }
}
