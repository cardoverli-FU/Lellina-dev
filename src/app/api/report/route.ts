// ════════════════════════════════════════════════════════════════════
//  Lellina — Report API (Phase 2.21)
//  Community moderation. Any user can report profiles/messages/events.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { db } from '@/lib/db'

const VALID_TARGET_TYPES = ['PROFILE', 'MESSAGE', 'EVENT', 'PHOTO']
const VALID_REASONS = ['ILLEGAL', 'HARASSMENT', 'IMPERSONATION', 'SPAM', 'UNDERAGE', 'OTHER']

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { targetType, targetId, reason, description } = body

    if (!VALID_TARGET_TYPES.includes(targetType)) {
      return NextResponse.json(
        { error: 'Invalid target type' },
        { status: 400 }
      )
    }

    if (!VALID_REASONS.includes(reason)) {
      return NextResponse.json(
        { error: 'Invalid reason' },
        { status: 400 }
      )
    }

    if (!targetId) {
      return NextResponse.json(
        { error: 'Target ID required' },
        { status: 400 }
      )
    }

    const report = await db.report.create({
      data: {
        reporterId: user.id,
        targetType,
        targetId,
        reason,
        description: description || null,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      success: true,
      reportId: report.id,
      message: 'Report submitted. Thank you for keeping Lellina safe.',
    })

  } catch (error) {
    console.error('[report] Error:', error)
    return NextResponse.json(
      { error: 'Report submission failed' },
      { status: 500 }
    )
  }
}
