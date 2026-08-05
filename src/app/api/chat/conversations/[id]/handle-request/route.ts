// ════════════════════════════════════════════════════════════════════
//  Phase 5.4 — Handle Request (social handles hidden until mutual approval)
//  POST /api/chat/conversations/[id]/handle-request
//    { action: 'request' | 'accept' | 'decline' }
//
//  REQUEST: one user asks to share social handles.
//  ACCEPT: handles revealed to BOTH users (mutual).
//  DECLINE: request closed, handles stay hidden.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

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
    const body = await req.json()
    const { action } = body as { action: 'request' | 'accept' | 'decline' }

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

    const otherId = conv.userAId === user.id ? conv.userBId : conv.userAId

    if (action === 'request') {
      // Check for existing pending request
      const existing = await db.handleRequest.findFirst({
        where: { conversationId: id, status: 'PENDING' },
        select: { id: true },
      })
      if (existing) {
        return NextResponse.json({ error: 'A handle request is already pending' }, { status: 409 })
      }

      const hr = await db.handleRequest.create({
        data: { conversationId: id, fromId: user.id },
      })

      // System message
      await db.message.create({
        data: {
          conversationId: id,
          senderId: user.id,
          type: 'SYSTEM',
          content: '💌 Handle request sent — waiting for a yes.',
          deliveredAt: new Date(),
        },
      })

      return NextResponse.json({ handleRequest: hr }, { status: 201 })
    }

    if (action === 'accept' || action === 'decline') {
      // Find the pending request (must be FROM the other user)
      const hr = await db.handleRequest.findFirst({
        where: { conversationId: id, status: 'PENDING', fromId: otherId },
        orderBy: { createdAt: 'desc' },
      })
      if (!hr) {
        return NextResponse.json({ error: 'No pending handle request' }, { status: 404 })
      }

      await db.handleRequest.update({
        where: { id: hr.id },
        data: {
          status: action === 'accept' ? 'ACCEPTED' : 'DECLINED',
          respondedAt: new Date(),
        },
      })

      // System message
      await db.message.create({
        data: {
          conversationId: id,
          senderId: user.id,
          type: 'SYSTEM',
          content:
            action === 'accept'
              ? '✨ Social handles are now shared with both of you.'
              : 'Handle request declined.',
          deliveredAt: new Date(),
        },
      })

      return NextResponse.json({ ok: true, status: action === 'accept' ? 'ACCEPTED' : 'DECLINED' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('[handle-request] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
