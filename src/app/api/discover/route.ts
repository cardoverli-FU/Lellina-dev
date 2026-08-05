// ════════════════════════════════════════════════════════════════════
//  Lellina — Discover API (Phase 4.1 / 4.20)
//  GET /api/discover → profiles for the current user's country.
//
//  Features:
//  - Country isolation (TZ sees only TZ, KE sees only KE, admin sees all)
//  - Founder pinned first
//  - Filters: age range, district, tribe tags, verified-only, online-only, has-photo, recently-active, response-rate
//  - Excludes: self, already-liked/passed profiles
//  - Pagination: offset-based (page + limit)
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { pinFounderFirst } from '@/lib/founder-pin'

// ISO alpha-2 → DB country name (District.country field stores full name)
const COUNTRY_MAP: Record<string, string> = {
  TZ: 'Tanzania',
  KE: 'Kenya',
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isVerified) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ─── Parse query params ──────────────────────────────────────
    const url = new URL(req.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const limit = Math.min(24, Math.max(1, parseInt(url.searchParams.get('limit') || '12', 10)))
    const ageMin = url.searchParams.get('ageMin') ? parseInt(url.searchParams.get('ageMin')!, 10) : undefined
    const ageMax = url.searchParams.get('ageMax') ? parseInt(url.searchParams.get('ageMax')!, 10) : undefined
    const districts = url.searchParams.get('districts')?.split(',').filter(Boolean) || []
    const tags = url.searchParams.get('tags')?.split(',').filter(Boolean) || []
    const verifiedOnly = url.searchParams.get('verified') !== 'false' // default true
    const onlineOnly = url.searchParams.get('online') === 'true'
    const hasPhoto = url.searchParams.get('hasPhoto') === 'true'
    const recentlyActive = url.searchParams.get('recentlyActive') === 'true'
    const responseRate = url.searchParams.get('responseRate') || 'ALL' // 'ALL' | 'FAST' | 'NOT_GHOST'

    // ─── Build where clause ──────────────────────────────────────
    // Use AND array to properly combine all conditions without clobbering
    const conditions: Record<string, unknown>[] = [
      { userId: { not: user.id } },
    ]

    // HARD Country isolation: TZ sees ONLY TZ profiles. KE sees ONLY KE.
    // Never mixed. Never cross-country. Admin sees all.
    if (user.role !== 'ADMIN') {
      if (user.country) {
        conditions.push({ user: { country: user.country } })
      } else {
        // No country on user — return empty (shouldn't happen, but safety)
        return NextResponse.json({ profiles: [], hasMore: false, page, total: 0 })
      }
    }

    // Verified filter
    if (verifiedOnly) {
      conditions.push({ user: { isVerified: true } })
    }

    // Exclude profiles the current user has already liked/passed
    conditions.push({
      NOT: {
        user: {
          likesReceived: {
            some: { likerId: user.id },
          },
        },
      },
    })

    // Age filter
    if (ageMin !== undefined || ageMax !== undefined) {
      const ageFilter: Record<string, number> = {}
      if (ageMin !== undefined) ageFilter.gte = ageMin
      if (ageMax !== undefined) ageFilter.lte = ageMax
      conditions.push({ age: ageFilter })
    }

    // District filter
    if (districts.length > 0) {
      conditions.push({ districtId: { in: districts } })
    }

    const where = conditions.length === 1 ? conditions[0] : { AND: conditions }

    // ─── Fetch profiles ──────────────────────────────────────────
    const profiles = await db.profile.findMany({
      where,
      include: {
        district: { select: { name: true, region: true, country: true } },
        user: { select: { isVerified: true, country: true } },
      },
      orderBy: { lastActiveAt: 'desc' },
    })

    // ─── Resolve tribe tags ──────────────────────────────────────
    const allTags = await db.tribeTag.findMany()
    const tagMap = new Map(allTags.map((t) => [t.id, t]))

    const resolved = profiles.map((p) => {
      let tagIds: string[] = []
      try {
        tagIds = JSON.parse(p.tribeTags || '[]')
      } catch {
        tagIds = []
      }

      let photoUrls: string[] = []
      try {
        photoUrls = JSON.parse(p.photoUrls || '[]')
      } catch {
        photoUrls = []
      }

      const profileTags = tagIds
        .map((id) => tagMap.get(id))
        .filter(Boolean)
        .map((t) => ({ id: t!.id, name: t!.name, category: t!.category }))

      return {
        id: p.id,
        userId: p.userId,
        displayName: p.displayName,
        age: p.age,
        bio: p.bio,
        photoUrls,
        isOnline: p.isOnline,
        lastActiveAt: p.lastActiveAt?.toISOString() || null,
        isFounder: p.isFounder,
        responseRateTier: p.responseRateTier,
        isVerified: p.user?.isVerified ?? false,
        district: p.district
          ? { name: p.district.name, region: p.district.region, country: p.district.country }
          : null,
        tribeTags: profileTags,
      }
    })

    // ─── JS-level filters (JSON fields that Prisma can't filter natively) ──
    let filtered = resolved

    // Tag filter
    if (tags.length > 0) {
      filtered = filtered.filter((p) => p.tribeTags.some((t) => tags.includes(t.id)))
    }

    // Online now filter
    if (onlineOnly) {
      filtered = filtered.filter((p) => p.isOnline)
    }

    // Has photo filter
    if (hasPhoto) {
      filtered = filtered.filter((p) => p.photoUrls.length > 0)
    }

    // Recently active (last 24h)
    if (recentlyActive) {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
      filtered = filtered.filter((p) => p.lastActiveAt && new Date(p.lastActiveAt) >= cutoff)
    }

    // Response rate filter
    if (responseRate === 'FAST') {
      filtered = filtered.filter((p) => p.responseRateTier === 'FAST')
    } else if (responseRate === 'NOT_GHOST') {
      filtered = filtered.filter((p) => p.responseRateTier !== 'GHOST')
    }

    // ─── Pin founder first, then paginate ────────────────────────
    const sorted = pinFounderFirst(filtered)

    const start = (page - 1) * limit
    const paged = sorted.slice(start, start + limit)
    const hasMore = start + limit < sorted.length

    return NextResponse.json({
      profiles: paged,
      hasMore,
      page,
      total: sorted.length,
    })
  } catch (error) {
    console.error('[api/discover] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
  }
}
