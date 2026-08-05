// ════════════════════════════════════════════════════════════════════
//  Phase 5.15 — Ghost Nudge
//  POST /api/chat/conversations/[id]/nudge
//  After 3+ days of silence, send ONE "Still there? 👋" nudge.
//  Max 1 nudge per conversation per 24h.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { canSendNudge } from '@/lib/ghost-score'

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
    if (conv.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Conversation is closed' }, { status: 403 })
    }

    // Check nudge eligibility
    const check = await canSendNudge(id, user.id)
    if (!check.allowed) {
      return NextResponse.json({ error: check.reason }, { status: 403 })
    }

    // Create the nudge + message (transaction)
    const message = await db.$transaction(async (tx) => {
      await tx.ghostNudge.create({
        data: { conversationId: id, sentBy: user.id },
      })

      const msg = await tx.message.create({
        data: {
          conversationId: id,
          senderId: user.id,
          type: 'NUDGE',
          content: 'Still there? 👋',
          deliveredAt: new Date(),
        },
      })

      await tx.conversation.update({
        where: { id },
        data: {
          lastMessageAt: new Date(),
          lastMessagePreview: 'Still there? 👋',
          lastMessageSender: user.id,
        },
      })

      return msg
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (err) {
    console.error('[nudge] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
