// ════════════════════════════════════════════════════════════════════
//  Phase 5.8 — Accept Chat Request
//  POST /api/chat/request/[id]/accept → creates a Conversation (1:1)
//  userAId < userBId lexicographically (prevents duplicates).
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
    if (!user || (!user.isVerified && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const request = await db.chatRequest.findUnique({
      where: { id },
      select: { id: true, fromId: true, toId: true, status: true },
    })

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (request.toId !== user.id) {
      return NextResponse.json({ error: 'Not your request to accept' }, { status: 403 })
    }

    if (request.status !== 'PENDING') {
      return NextResponse.json({ error: `Request already ${request.status}` }, { status: 409 })
    }

    // Lexicographic ordering: userAId < userBId
    const [userAId, userBId] =
      request.fromId < request.toId
        ? [request.fromId, request.toId]
        : [request.toId, request.fromId]

    // Create conversation + mark request accepted (transaction)
    const conversation = await db.$transaction(async (tx) => {
      const conv = await tx.conversation.create({
        data: {
          userAId,
          userBId,
          requestId: request.id,
          status: 'ACTIVE',
          lastMessageAt: new Date(),
          lastMessagePreview: 'Conversation started 💛',
        },
      })

      await tx.chatRequest.update({
        where: { id: request.id },
        data: { status: 'ACCEPTED', respondedAt: new Date() },
      })

      // System message: conversation started
      await tx.message.create({
        data: {
          conversationId: conv.id,
          senderId: user.id,
          type: 'SYSTEM',
          content: 'You can now chat. Be kind. 💛',
          deliveredAt: new Date(),
          readAt: new Date(),
        },
      })

      return conv
    })

    return NextResponse.json({ conversation }, { status: 201 })
  } catch (err) {
    console.error('[chat/request/accept] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
