// ════════════════════════════════════════════════════════════════════
//  Phase 5.16 — Ghost Score
//  GET /api/ghost-score?userId=... → { badge }  (defaults to current user)
//  POST /api/ghost-score { userId } → recalculate (admin only)
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { getGhostBadge, recalculateGhostScore } from '@/lib/ghost-score'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const targetUserId = url.searchParams.get('userId') || user.id

    const badge = await getGhostBadge(targetUserId)
    return NextResponse.json({ badge })
  } catch (err) {
    console.error('[ghost-score GET] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const body = await req.json()
    const { userId } = body as { userId: string }
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const badge = await recalculateGhostScore(userId)
    return NextResponse.json({ badge })
  } catch (err) {
    console.error('[ghost-score POST] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
