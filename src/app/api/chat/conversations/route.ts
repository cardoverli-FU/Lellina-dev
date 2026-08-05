// ════════════════════════════════════════════════════════════════════
//  Phase 5.2 — List Conversations
//  GET /api/chat/conversations → active + recently closed conversations
//  Includes other user's profile + last message preview.
// ════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { formatLastSeen } from '@/lib/last-seen'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversations = await db.conversation.findMany({
      where: {
        OR: [{ userAId: user.id }, { userBId: user.id }],
      },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        userA: {
          select: {
            id: true,
            profile: {
              select: {
                displayName: true,
                age: true,
                photoUrls: true,
                district: { select: { name: true } },
                responseRateTier: true,
                isOnline: true,
                lastActiveAt: true,
              },
            },
          },
        },
        userB: {
          select: {
            id: true,
            profile: {
              select: {
                displayName: true,
                age: true,
                photoUrls: true,
                district: { select: { name: true } },
                responseRateTier: true,
                isOnline: true,
                lastActiveAt: true,
              },
            },
          },
        },
      },
    })

    // Shape: each conversation gets `otherUser` + `lastSeenText`
    const shaped = conversations.map((conv) => {
      const isUserA = conv.userAId === user.id
      const otherUser = isUserA ? conv.userB : conv.userA
      const profile = otherUser.profile

      return {
        id: conv.id,
        status: conv.status,
        closedBy: conv.closedBy,
        exitReason: conv.exitReason,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        lastMessageAt: conv.lastMessageAt,
        lastMessagePreview: conv.lastMessagePreview,
        lastMessageSender: conv.lastMessageSender,
        otherUser: {
          id: otherUser.id,
          displayName: profile?.displayName || 'Anonymous',
          age: profile?.age,
          photoUrls: profile?.photoUrls ? JSON.parse(profile.photoUrls) : [],
          district: profile?.district,
          responseRateTier: profile?.responseRateTier,
          isOnline: profile?.isOnline,
          lastSeenText: formatLastSeen(profile?.isOnline ?? false, profile?.lastActiveAt ?? null),
        },
      }
    })

    return NextResponse.json({ conversations: shaped })
  } catch (err) {
    console.error('[chat/conversations] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
