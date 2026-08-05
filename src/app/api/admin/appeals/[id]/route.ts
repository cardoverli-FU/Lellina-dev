// ════════════════════════════════════════════════════════════════════
//  Lellina — Admin Appeal Detail API
//  Fetch a single appeal with media for review. Admin only.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { id } = await params

    const appeal = await db.appeal.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            createdAt: true,
            bannedAt: true,
            banReason: true,
          },
        },
      },
    })

    if (!appeal) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Get the original verification attempt if linked
    let originalAttempt = null
    if (appeal.attemptId) {
      originalAttempt = await db.verificationAttempt.findUnique({
        where: { id: appeal.attemptId },
        select: {
          verdict: true,
          cloudScores: true,
          createdAt: true,
          failReason: true,
        },
      })
    }

    // Audit log
    await db.adminAuditLog.create({
      data: {
        adminId: admin.id,
        action: 'VIEW_APPEAL_DETAIL',
        targetType: 'APPEAL',
        targetId: id,
      },
    })

    return NextResponse.json({ appeal, originalAttempt })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed'
    const status = message === 'UNAUTHORIZED' ? 401 : message === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
