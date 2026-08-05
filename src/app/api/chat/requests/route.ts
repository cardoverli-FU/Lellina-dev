// ════════════════════════════════════════════════════════════════════
//  Phase 5.8 — List Chat Requests
//  GET /api/chat/requests → { incoming: [...], outgoing: [...] }
//  Incoming = requests TO me (PENDING). Outgoing = requests FROM me (PENDING/ACCEPTED).
// ════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [incoming, outgoing] = await Promise.all([
      // Requests sent TO me, pending my response
      db.chatRequest.findMany({
        where: { toId: user.id, status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        include: {
          from: {
            select: {
              id: true,
              profile: {
                select: {
                  displayName: true,
                  age: true,
                  photoUrls: true,
                  district: { select: { name: true, region: true } },
                  responseRateTier: true,
                  isOnline: true,
                  lastActiveAt: true,
                },
              },
            },
          },
        },
      }),
      // Requests I sent (PENDING or ACCEPTED — not declined/expired)
      db.chatRequest.findMany({
        where: { fromId: user.id, status: { in: ['PENDING', 'ACCEPTED'] } },
        orderBy: { createdAt: 'desc' },
        include: {
          to: {
            select: {
              id: true,
              profile: {
                select: {
                  displayName: true,
                  age: true,
                  photoUrls: true,
                  district: { select: { name: true, region: true } },
                  responseRateTier: true,
                  isOnline: true,
                  lastActiveAt: true,
                },
              },
            },
          },
        },
      }),
    ])

    return NextResponse.json({ incoming, outgoing })
  } catch (err) {
    console.error('[chat/requests] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
