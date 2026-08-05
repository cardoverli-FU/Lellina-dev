// ════════════════════════════════════════════════════════════════════
//  Phase 5.5 — Mark Messages as Read
//  POST /api/chat/conversations/[id]/read
//  REST fallback for when socket isn't connected.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

export async function POST(
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

    const result = await db.message.updateMany({
      where: {
        conversationId: id,
        senderId: otherId,
        readAt: null,
        deletedAt: null,
      },
      data: { readAt: new Date(), deliveredAt: new Date() },
    })

    return NextResponse.json({ markedRead: result.count })
  } catch (err) {
    console.error('[chat/read] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
