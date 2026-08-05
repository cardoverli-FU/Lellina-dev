// ════════════════════════════════════════════════════════════════════
//  Phase 5.8/5.9 — Send Chat Request
//  POST /api/chat/request  { toUserId, message? }
//
//  Free: 1/day. Lelly: unlimited. One request per user-pair.
//  No match required — request-first model.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import {
  canSendChatRequest,
  hasExistingChatRequest,
  hasActiveConversation,
} from '@/lib/chat-limits'
import { markOnline } from '@/lib/last-seen'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (!user.isVerified && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { toUserId, message } = body as { toUserId: string; message?: string }

    if (!toUserId) {
      return NextResponse.json({ error: 'Missing toUserId' }, { status: 400 })
    }
    if (toUserId === user.id) {
      return NextResponse.json({ error: 'Cannot request yourself' }, { status: 400 })
    }
    if (message && message.length > 280) {
      return NextResponse.json({ error: 'Message too long (max 280 chars)' }, { status: 400 })
    }

    // Verify recipient exists + is verified + same country (hard isolation)
    const recipient = await db.user.findUnique({
      where: { id: toUserId },
      select: {
        id: true,
        isVerified: true,
        country: true,
        bannedAt: true,
        profile: { select: { displayName: true } },
      },
    })

    if (!recipient || !recipient.isVerified || recipient.bannedAt) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    // Hard country isolation (admin bypasses)
    if (user.role !== 'ADMIN') {
      if (recipient.country !== user.country) {
        return NextResponse.json({ error: 'Cross-country requests not allowed' }, { status: 403 })
      }
    }

    // Already have an active conversation?
    if (await hasActiveConversation(user.id, toUserId)) {
      return NextResponse.json({ error: 'You already have an active conversation' }, { status: 409 })
    }

    // Already sent a request?
    if (await hasExistingChatRequest(user.id, toUserId)) {
      return NextResponse.json({ error: 'Request already sent' }, { status: 409 })
    }

    // Check daily limit
    const limitCheck = await canSendChatRequest(user.id)
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: 'Daily chat request limit reached', remaining: 0, lellyRequired: true },
        { status: 403 }
      )
    }

    // Create the request
    const request = await db.chatRequest.create({
      data: {
        fromId: user.id,
        toId: toUserId,
        message: message?.trim() || null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7-day expiry
      },
      include: {
        from: { select: { profile: { select: { displayName: true, photoUrls: true } } } },
      },
    })

    await markOnline(user.id)

    return NextResponse.json({ request }, { status: 201 })
  } catch (err) {
    console.error('[chat/request] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
