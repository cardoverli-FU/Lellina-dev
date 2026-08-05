// ════════════════════════════════════════════════════════════════════
//  Lellina — Profile API (Phase 3)
//  GET  /api/profile  → get current user's profile
//  POST /api/profile  → create or update profile (setup wizard save)
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { db } from '@/lib/db'

// ─── GET: Fetch current user's profile ──────────────────────────────
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      include: {
        district: {
          select: { id: true, name: true, region: true, country: true, areas: true },
        },
      },
    })

    if (!profile) {
      return NextResponse.json({ profile: null })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('[api/profile GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

// ─── POST: Create or update profile ─────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      displayName,
      age,
      bio,
      photoUrls,
      districtId,
      streetTag,
      tribeTags,
      telegram,
      instagram,
      signal,
      otherSocial,
    } = body

    // ─── Validation ───────────────────────────────────────────────
    if (displayName !== undefined && typeof displayName !== 'string') {
      return NextResponse.json({ error: 'displayName must be a string' }, { status: 400 })
    }
    if (displayName !== undefined && displayName.trim().length === 0) {
      return NextResponse.json({ error: 'displayName cannot be empty' }, { status: 400 })
    }
    if (displayName !== undefined && displayName.length > 50) {
      return NextResponse.json({ error: 'displayName max 50 characters' }, { status: 400 })
    }

    if (age !== undefined && age !== null) {
      const ageNum = Number(age)
      if (!Number.isInteger(ageNum) || ageNum < 18 || ageNum > 100) {
        return NextResponse.json({ error: 'age must be 18–100' }, { status: 400 })
      }
    }

    if (bio !== undefined && bio !== null && typeof bio !== 'string') {
      return NextResponse.json({ error: 'bio must be a string' }, { status: 400 })
    }
    if (bio !== undefined && bio !== null && bio.length > 500) {
      return NextResponse.json({ error: 'bio max 500 characters' }, { status: 400 })
    }

    if (districtId !== undefined && districtId !== null) {
      const district = await db.district.findUnique({ where: { id: districtId } })
      if (!district) {
        return NextResponse.json({ error: 'Invalid districtId' }, { status: 400 })
      }
    }

    if (tribeTags !== undefined && !Array.isArray(tribeTags)) {
      return NextResponse.json({ error: 'tribeTags must be an array' }, { status: 400 })
    }
    if (tribeTags !== undefined && tribeTags.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 tribe tags' }, { status: 400 })
    }
    if (tribeTags !== undefined && tribeTags.length > 0) {
      const validTags = await db.tribeTag.findMany({
        where: { id: { in: tribeTags } },
        select: { id: true },
      })
      const validIds = new Set(validTags.map((t) => t.id))
      const invalid = tribeTags.filter((id: string) => !validIds.has(id))
      if (invalid.length > 0) {
        return NextResponse.json({ error: `Invalid tribe tag IDs: ${invalid.join(', ')}` }, { status: 400 })
      }
    }

    if (photoUrls !== undefined && !Array.isArray(photoUrls)) {
      return NextResponse.json({ error: 'photoUrls must be an array' }, { status: 400 })
    }
    if (photoUrls !== undefined && photoUrls.length > 6) {
      return NextResponse.json({ error: 'Maximum 6 photos' }, { status: 400 })
    }

    // Social handles: max length
    for (const [key, val] of [['telegram', telegram], ['instagram', instagram], ['signal', signal], ['otherSocial', otherSocial]]) {
      if (val !== undefined && val !== null && typeof val === 'string' && val.length > 200) {
        return NextResponse.json({ error: `${key} max 200 characters` }, { status: 400 })
      }
    }

    // ─── Upsert profile ──────────────────────────────────────────
    const data: Record<string, unknown> = {}
    if (displayName !== undefined) data.displayName = displayName.trim()
    if (age !== undefined) data.age = age !== null ? Number(age) : null
    if (bio !== undefined) data.bio = bio !== null ? bio.trim() : null
    if (photoUrls !== undefined) data.photoUrls = JSON.stringify(photoUrls)
    if (districtId !== undefined) data.districtId = districtId
    if (streetTag !== undefined) data.streetTag = streetTag !== null ? streetTag.trim() : null
    if (tribeTags !== undefined) data.tribeTags = JSON.stringify(tribeTags)
    if (telegram !== undefined) data.telegram = telegram
    if (instagram !== undefined) data.instagram = instagram
    if (signal !== undefined) data.signal = signal
    if (otherSocial !== undefined) data.otherSocial = otherSocial

    const profile = await db.profile.upsert({
      where: { userId: user.id },
      update: data,
      create: {
        userId: user.id,
        ...data,
      },
      include: {
        district: {
          select: { id: true, name: true, region: true, country: true, areas: true },
        },
      },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('[api/profile POST] Error:', error)
    const message = error instanceof Error ? error.message : 'Failed to save profile'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
