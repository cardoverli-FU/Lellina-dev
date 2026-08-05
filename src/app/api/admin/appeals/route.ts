// ════════════════════════════════════════════════════════════════════
//  Lellina — Admin Appeals API (Phase 2.19)
//  Fetch + review appeals. Admin only.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { db } from '@/lib/db'

// ─── GET: List appeals ──────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'PENDING'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    const appeals = await db.appeal.findMany({
      where: status === 'ALL' ? {} : { status },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: {
        id: true,
        userId: true,
        deviceFingerprint: true,
        ipAddress: true,
        attemptId: true,
        userMessage: true,
        status: true,
        adminNotes: true,
        reviewedBy: true,
        reviewedAt: true,
        createdAt: true,
        mediaDeleteAt: true,
        // NOTE: appealPhoto/Voice/Video are NOT included here — they're loaded
        // individually when admin clicks to review (reduces payload)
      },
    })

    // Log admin access
    await db.adminAuditLog.create({
      data: {
        adminId: admin.id,
        action: 'VIEW_APPEALS',
        targetType: 'APPEAL',
        details: JSON.stringify({ status, count: appeals.length }),
      },
    })

    return NextResponse.json({ appeals })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed'
    const status = message === 'UNAUTHORIZED' ? 401 : message === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

// ─── PATCH: Review an appeal ────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin()

    const body = await req.json()
    const { appealId, action, adminNotes } = body

    // action: "APPROVED" | "REJECTED" | "MORE_INFO" | "BANNED"
    const validActions = ['APPROVED', 'REJECTED', 'MORE_INFO', 'BANNED']
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (!appealId) {
      return NextResponse.json({ error: 'Appeal ID required' }, { status: 400 })
    }

    const appeal = await db.appeal.findUnique({
      where: { id: appealId },
      select: { id: true, userId: true, deviceFingerprint: true, status: true },
    })

    if (!appeal) {
      return NextResponse.json({ error: 'Appeal not found' }, { status: 404 })
    }

    // Update appeal
    await db.appeal.update({
      where: { id: appealId },
      data: {
        status: action,
        adminNotes: adminNotes || null,
        reviewedBy: admin.id,
        reviewedAt: new Date(),
        // Extend media deletion to 7 days from review
        mediaDeleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    // If approved: un-ban the user + mark verified
    if (action === 'APPROVED' && appeal.userId) {
      await db.user.update({
        where: { id: appeal.userId },
        data: {
          bannedAt: null,
          banReason: null,
          isVerified: true,
          verifiedAt: new Date(),
        },
      })
    }

    // If banned: ban the user + device
    if (action === 'BANNED' && appeal.userId) {
      await db.user.update({
        where: { id: appeal.userId },
        data: {
          bannedAt: new Date(),
          banReason: `Appeal rejected by admin: ${adminNotes || 'violation'}`,
        },
      })
    }

    // Audit log
    await db.adminAuditLog.create({
      data: {
        adminId: admin.id,
        action: `APPEAL_${action}`,
        targetType: 'APPEAL',
        targetId: appealId,
        details: JSON.stringify({ userId: appeal.userId, notes: adminNotes }),
      },
    })

    return NextResponse.json({ success: true, action })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed'
    const status = message === 'UNAUTHORIZED' ? 401 : message === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
