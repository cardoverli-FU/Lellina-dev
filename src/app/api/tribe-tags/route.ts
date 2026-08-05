// ════════════════════════════════════════════════════════════════════
//  Lellina — Tribe Tags API (Phase 3)
//  GET /api/tribe-tags → all tribe tags grouped by category
// ════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const tags = await db.tribeTag.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })
    return NextResponse.json({ tags })
  } catch (error) {
    console.error('[api/tribe-tags] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch tribe tags' }, { status: 500 })
  }
}
