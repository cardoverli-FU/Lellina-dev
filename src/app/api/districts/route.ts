// ════════════════════════════════════════════════════════════════════
//  Lellina — Districts API (Phase 3 + Phase 4A country isolation)
//  GET /api/districts           → districts for the current user's country
//  GET /api/districts?country=ZA → districts for a specific country
//  GET /api/districts?country=all → all districts (admin/reference)
//
//  Country isolation: TZ users see only Dar es Salaam (5).
//                      ZA users see only Cape Town (8).
//                      Never mixed.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

// ISO alpha-2 → DB country name mapping
const COUNTRY_MAP: Record<string, string> = {
  ZA: 'South Africa',
  TZ: 'Tanzania',
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const queryCountry = url.searchParams.get('country')

    let countryName: string | undefined

    if (queryCountry && queryCountry.toLowerCase() === 'all') {
      // Explicit "all" — return every district (admin/reference only)
      countryName = undefined
    } else if (queryCountry) {
      // Explicit country code (e.g. ?country=ZA)
      countryName = COUNTRY_MAP[queryCountry.toUpperCase()] || queryCountry
    } else {
      // No query param — read from session (country isolation)
      const user = await getCurrentUser()
      if (user?.country) {
        countryName = COUNTRY_MAP[user.country]
      }
      // If no session or no country on user, return all (public reference)
    }

    const districts = await db.district.findMany({
      where: countryName ? { country: countryName } : undefined,
      orderBy: [{ country: 'asc' }, { region: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json({ districts })
  } catch (error) {
    console.error('[api/districts] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch districts' }, { status: 500 })
  }
}
