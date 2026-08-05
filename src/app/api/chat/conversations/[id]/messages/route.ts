// ════════════════════════════════════════════════════════════════════
//  Phase 5.2/5.5/5.6 — Messages: GET (list) + POST (send)
//  GET  /api/chat/conversations/[id]/messages?cursor=...
//  POST /api/chat/conversations/[id]/messages { content?, photoUrl? }
//
//  Photo gating:
//    - Free users RECEIVE photos blurred (photoUrl returned but UI blurs)
//    - Lelly users RECEIVE photos unblurred
//    - Both free + Lelly can SEND photos
//  The API returns the raw photoUrl; the CLIENT decides to blur based on
//  whether the CURRENT user has Lelly Pass.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { hasLellyPass } from '@/lib/gating'
import { recordReply } from '@/lib/ghost-score'
import { markOnline } from '@/lib/last-seen'

// ─── GET: list messages (cursor pagination) ─────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const url = new URL(req.url)
    const cursor = url.searchParams.get('cursor')
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '30', 10)))

    // Verify participation
    const conv = await db.conversation.findUnique({
      where: { id },
      select: { userAId: true, userBId: true, status: true },
    })
    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }
    if (conv.userAId !== user.id && conv.userBId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const otherUserId = conv.userAId === user.id ? conv.userBId : conv.userAId
    const hasPass = await hasLellyPass(user.id)

    const messages = await db.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor
        ? { cursor: { id: cursor }, skip: 1 }
        : {}),
      select: {
        id: true,
        senderId: true,
        content: true,
        photoUrl: true,
        photoWidth: true,
        photoHeight: true,
        type: true,
        deliveredAt: true,
        readAt: true,
        deletedAt: true,
        deletedById: true,
        createdAt: true,
      },
    })

    const hasMore = messages.length > limit
    const items = hasMore ? messages.slice(0, limit) : messages
    const nextCursor = hasMore ? items[items.length - 1].id : null

    // Reverse so oldest is first (chat display order)
    items.reverse()

    // Mark messages from the other person as read + delivered
    await db.message.updateMany({
      where: {
        conversationId: id,
        senderId: otherUserId,
        readAt: null,
        deletedAt: null,
      },
      data: { readAt: new Date(), deliveredAt: new Date() },
    })

    return NextResponse.json({
      messages: items,
      nextCursor,
      hasMore,
      otherUserId,
      hasLellyPass: hasPass, // client uses this to decide blur
    })
  } catch (err) {
    console.error('[chat/messages GET] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// ─── POST: send a message (also used as REST fallback to socket) ────
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
    const { content, photoUrl } = body as { content?: string; photoUrl?: string }

    // Verify participation + active
    const conv = await db.conversation.findUnique({
      where: { id },
      select: { userAId: true, userBId: true, status: true },
    })
    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }
    if (conv.userAId !== user.id && conv.userBId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (conv.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Conversation is closed' }, { status: 403 })
    }

    const msgType = photoUrl ? 'PHOTO' : 'TEXT'
    if (msgType === 'TEXT' && !content?.trim()) {
      return NextResponse.json({ error: 'Empty message' }, { status: 400 })
    }
    if (content && content.length > 2000) {
      return NextResponse.json({ error: 'Message too long (max 2000 chars)' }, { status: 400 })
    }
    if (photoUrl && photoUrl.length > 4 * 1024 * 1024) {
      return NextResponse.json({ error: 'Photo too large (max 4MB)' }, { status: 400 })
    }

    const otherUserId = conv.userAId === user.id ? conv.userBId : conv.userAId

    // Check if other user is online (for deliveredAt)
    const otherProfile = await db.profile.findUnique({
      where: { userId: otherUserId },
      select: { isOnline: true },
    })

    const message = await db.message.create({
      data: {
        conversationId: id,
        senderId: user.id,
        content: content?.trim() || null,
        photoUrl: photoUrl || null,
        type: msgType,
        deliveredAt: otherProfile?.isOnline ? new Date() : null,
      },
    })

    // Update conversation preview
    const preview = content || '📷 Photo'
    await db.conversation.update({
      where: { id },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: preview.slice(0, 100),
        lastMessageSender: user.id,
        updatedAt: new Date(),
      },
    })

    // Ghost score: record this as a reply
    await recordReply(id, user.id)
    await markOnline(user.id)

    return NextResponse.json({ message }, { status: 201 })
  } catch (err) {
    console.error('[chat/messages POST] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
