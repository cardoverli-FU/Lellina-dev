// ════════════════════════════════════════════════════════════════════
//  Phase 5.17 — Ghost Flag (Report Ghosting)
//  POST /api/chat/conversations/[id]/flag
//  After 7+ days of silence, report the other person as a ghost.
//  Accumulated flags → ghost reputation. Admin can warn/ban.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { canReportGhost, recalculateGhostScore } from '@/lib/ghost-score'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || (!user.isVerified && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const conv = await db.conversation.findUnique({
      where: { id },
      select: { userAId: true, userBId: true, status: true },
    })
    if (!conv) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (conv.userAId !== user.id && conv.userBId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const ghostId = conv.userAId === user.id ? conv.userBId : conv.userAId

    // Check flag eligibility
    const check = await canReportGhost(id, user.id)
    if (!check.allowed) {
      return NextResponse.json({ error: check.reason }, { status: 403 })
    }

    // Create the flag
    await db.ghostFlag.create({
      data: {
        conversationId: id,
        reporterId: user.id,
        ghostId,
      },
    })

    // Recalculate the ghost's score (flags drag it down)
    const badge = await recalculateGhostScore(ghostId)

    // Close the conversation with an exit reason
    await db.conversation.update({
      where: { id },
      data: {
        status: 'EXITED',
        closedBy: user.id,
        exitReason: 'GHOST_FLAG',
      },
    })

    return NextResponse.json({
      ok: true,
      ghostBadge: badge,
      message: 'Ghost reported. You can move on with peace of mind. 💛',
    }, { status: 201 })
  } catch (err) {
    console.error('[ghost-flag] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
