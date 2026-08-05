// ════════════════════════════════════════════════════════════════════
//  Lellina — Profile by ID API (Phase 3)
//  GET /api/profile/[id] → fetch a public profile (no social handles)
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const profile = await db.profile.findUnique({
      where: { id },
      select: {
        id: true,
        displayName: true,
        age: true,
        bio: true,
        photoUrls: true,
        districtId: true,
        district: {
          select: { name: true, region: true, country: true },
        },
        streetTag: true,
        tribeTags: true,
        // Social handles intentionally EXCLUDED — hidden until mutual (Phase 5)
        isOnline: true,
        lastActiveAt: true,
        isFounder: true,
        createdAt: true,
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('[api/profile/[id]] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}
