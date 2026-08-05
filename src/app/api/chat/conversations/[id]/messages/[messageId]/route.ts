// ════════════════════════════════════════════════════════════════════
//  Phase 5.7 — Delete Message (Lelly Pass only)
//  DELETE /api/chat/conversations/[id]/messages/[messageId]
//  Soft-deletes: content nulled, deletedAt set. Disappears for BOTH.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { hasLellyPass } from '@/lib/gating'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, messageId } = await params

    // Verify Lelly Pass
    const hasPass = await hasLellyPass(user.id)
    if (!hasPass) {
      return NextResponse.json(
        { error: 'Lelly Pass required to delete messages', lellyRequired: true },
        { status: 403 }
      )
    }

    // Verify conversation participation
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

    // Verify message exists + belongs to this conversation + sender is the user
    const message = await db.message.findUnique({
      where: { id: messageId },
      select: { conversationId: true, senderId: true, deletedAt: true },
    })
    if (!message || message.conversationId !== id) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    if (message.senderId !== user.id) {
      return NextResponse.json({ error: 'Can only delete your own messages' }, { status: 403 })
    }
    if (message.deletedAt) {
      return NextResponse.json({ error: 'Already deleted' }, { status: 409 })
    }

    // Soft-delete: null content + photoUrl, set deletedAt + deletedById
    await db.message.update({
      where: { id: messageId },
      data: {
        content: null,
        photoUrl: null,
        deletedAt: new Date(),
        deletedById: user.id,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[message DELETE] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
