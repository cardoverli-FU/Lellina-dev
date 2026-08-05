// ════════════════════════════════════════════════════════════════════
//  Phase 5.14 — "Not Feeling It" Kind Exit
//  POST /api/chat/conversations/[id]/not-feeling-it
//
//  Sends a pre-written kind message, then closes the conversation.
//  Replaces ghosting with a graceful exit.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

const KIND_EXIT_MESSAGES = [
  "Hey, I don't think we're a match. Wishing you well! 💛",
  "I've enjoyed chatting, but I don't feel the spark. You deserve someone who's all in. 💛",
  "Thank you for the conversation — I don't think we're the right fit. Take care! 💛",
  "You're lovely, but I'm not feeling the connection. Wishing you the best! 💛",
]

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || (!user.isVerified && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const customMessage = (body as { message?: string })?.message?.trim()
    const exitMessage =
      customMessage && customMessage.length <= 280
        ? customMessage
        : KIND_EXIT_MESSAGES[Math.floor(Math.random() * KIND_EXIT_MESSAGES.length)]

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
      return NextResponse.json({ error: 'Conversation already closed' }, { status: 409 })
    }

    // Send the kind exit message + close the conversation (transaction)
    const message = await db.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          conversationId: id,
          senderId: user.id,
          type: 'NOT_FEELING_IT',
          content: exitMessage,
          deliveredAt: new Date(),
        },
      })

      await tx.conversation.update({
        where: { id },
        data: {
          status: 'EXITED',
          closedBy: user.id,
          exitReason: 'NOT_FEELING_IT',
          exitMessage,
          lastMessageAt: new Date(),
          lastMessagePreview: exitMessage.slice(0, 100),
          lastMessageSender: user.id,
        },
      })

      return msg
    })

    return NextResponse.json({ message, exitMessage }, { status: 201 })
  } catch (err) {
    console.error('[not-feeling-it] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
