// ════════════════════════════════════════════════════════════════════
//  Phase 5.4 — Handle Status
//  GET /api/chat/conversations/[id]/handle-status
//  Returns the current handle-request status + other user's handles (if accepted).
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const conv = await db.conversation.findUnique({
      where: { id },
      select: { userAId: true, userBId: true },
    })
    if (!conv) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (conv.userAId !== user.id && conv.userBId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const otherId = conv.userAId === user.id ? conv.userBId : conv.userAId

    // Find the most recent handle request in this conversation
    const hr = await db.handleRequest.findFirst({
      where: { conversationId: id },
      orderBy: { createdAt: 'desc' },
      select: { status: true, fromId: true },
    })

    let status: 'NONE' | 'PENDING_FROM_ME' | 'PENDING_FROM_THEM' | 'ACCEPTED' = 'NONE'
    if (hr) {
      if (hr.status === 'ACCEPTED') {
        status = 'ACCEPTED'
      } else if (hr.status === 'PENDING') {
        status = hr.fromId === user.id ? 'PENDING_FROM_ME' : 'PENDING_FROM_THEM'
      }
    }

    // If accepted, fetch the other user's social handles
    let handles: Record<string, string | null> = {}
    if (status === 'ACCEPTED') {
      const otherProfile = await db.profile.findUnique({
        where: { userId: otherId },
        select: { telegram: true, instagram: true, signal: true, otherSocial: true },
      })
      handles = {
        telegram: otherProfile?.telegram || null,
        instagram: otherProfile?.instagram || null,
        signal: otherProfile?.signal || null,
        otherSocial: otherProfile?.otherSocial || null,
      }
    }

    return NextResponse.json({ status, handles })
  } catch (err) {
    console.error('[handle-status] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
