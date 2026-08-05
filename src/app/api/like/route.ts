// ════════════════════════════════════════════════════════════════════
//  Lellina — Like / Pass API (Phase 4.3)
//  POST /api/like → { targetId, action: "LIKE" | "PASS" }
//
//  - Upserts a Like record (one per user-pair, unique constraint)
//  - If mutual LIKE (both liked each other) → creates a Match atomically
//  - Returns { matched: boolean, matchId?: string }
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isVerified) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { targetId, action } = body

    // ─── Validate ────────────────────────────────────────────────
    if (!targetId || typeof targetId !== 'string') {
      return NextResponse.json({ error: 'Missing targetId.' }, { status: 400 })
    }
    if (!action || !['LIKE', 'PASS'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be LIKE or PASS.' }, { status: 400 })
    }
    if (targetId === user.id) {
      return NextResponse.json({ error: 'Cannot like yourself.' }, { status: 400 })
    }

    // ─── Verify target exists ────────────────────────────────────
    const target = await db.user.findUnique({
      where: { id: targetId },
      select: { id: true, isVerified: true },
    })
    if (!target) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    // ─── Upsert the like/pass record ─────────────────────────────
    await db.like.upsert({
      where: { likerId_likedId: { likerId: user.id, likedId: targetId } },
      update: { action },
      create: { likerId: user.id, likedId: targetId, action },
    })

    // ─── If LIKE, check for mutual match ─────────────────────────
    if (action === 'LIKE') {
      const reverseLike = await db.like.findUnique({
        where: { likerId_likedId: { likerId: targetId, likedId: user.id } },
      })

      if (reverseLike?.action === 'LIKE') {
        // Mutual like → create match (lexicographic ordering prevents dupes)
        const [userAId, userBId] = [user.id, targetId].sort()

        const match = await db.match.upsert({
          where: { userAId_userBId: { userAId, userBId } },
          update: {},
          create: { userAId, userBId },
        })

        return NextResponse.json({ matched: true, matchId: match.id })
      }
    }

    return NextResponse.json({ matched: false })
  } catch (error) {
    console.error('[api/like] Error:', error)
    return NextResponse.json({ error: 'Failed to process action.' }, { status: 500 })
  }
}
