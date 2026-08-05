// ════════════════════════════════════════════════════════════════════
//  Lellina — Discover API (Phase 4.1 / 4.20)
//  GET /api/discover → profiles for the current user's country.
//
//  Features:
//  - Country isolation (TZ sees only TZ, ZA sees only ZA, admin sees all)
//  - Founder pinned first
//  - Filters: age range, district, tribe tags, verified-only
//  - Excludes: self, already-liked/passed profiles
//  - Pagination: offset-based (page + limit)
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { pinFounderFirst } from '@/lib/founder-pin'

// ISO alpha-2 → DB country name
const COUNTRY_MAP: Record<string, string> = {
  ZA: 'South Africa',
  TZ: 'Tanzania',
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

    // ─── Build where clause ──────────────────────────────────────
    // Country isolation: non-admin users see only their country's profiles
    const userFilter: Record<string, unknown> = {}
    if (user.country && user.role !== 'ADMIN') {
      userFilter.country = user.country
    }
    if (verifiedOnly) {
      userFilter.isVerified = true
    }

    const where: Record<string, unknown> = {
      userId: { not: user.id },
      // Exclude profiles the current user has already liked/passed
      NOT: {
        user: {
          likesReceived: {
            some: { likerId: user.id },
          },
        },
      },
    }

    if (Object.keys(userFilter).length > 0) {
      where.user = userFilter
    }

    // Age filter
    if (ageMin !== undefined || ageMax !== undefined) {
      const ageFilter: Record<string, number> = {}
      if (ageMin !== undefined) ageFilter.gte = ageMin
      if (ageMax !== undefined) ageFilter.lte = ageMax
      where.age = ageFilter
    }

    // District filter
    if (districts.length > 0) {
      where.districtId = { in: districts }
    }

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

    // ─── Filter by tags (JS-level, since tribeTags is JSON) ──────
    const tagFiltered = tags.length > 0
      ? resolved.filter((p) => p.tribeTags.some((t) => tags.includes(t.id)))
      : resolved

    // ─── Pin founder first, then paginate ────────────────────────
    const sorted = pinFounderFirst(tagFiltered)

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
