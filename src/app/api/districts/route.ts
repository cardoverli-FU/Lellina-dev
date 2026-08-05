// ════════════════════════════════════════════════════════════════════
//  Lellina — Districts API (Phase 3 + Phase 4A country isolation)
//  HARD ISOLATION: TZ users see ONLY TZ districts. KE users see ONLY KE.
//  Never mixed. Never cross-country.
//
//  GET /api/districts           → districts for the current user's country ONLY
//  GET /api/districts?country=all → all districts (ADMIN ONLY)
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

// ISO alpha-2 → DB country name mapping
const COUNTRY_MAP: Record<string, string> = {
  TZ: 'Tanzania',
  KE: 'Kenya',
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const queryCountry = url.searchParams.get('country')
    const user = await getCurrentUser()

    let countryName: string | undefined

    if (queryCountry && queryCountry.toLowerCase() === 'all') {
      // "all" — ADMIN ONLY. Regular users NEVER see cross-country districts.
      if (user?.role !== 'ADMIN') {
        // Non-admin requesting "all" → force to their own country
        if (user?.country) {
          countryName = COUNTRY_MAP[user.country]
        } else {
          // No session and no country → return empty (not all!)
          return NextResponse.json({ districts: [] })
        }
      }
      // Admin gets all districts
    } else if (queryCountry) {
      // Explicit country code — but enforce: user can ONLY request their own country
      const requestedName = COUNTRY_MAP[queryCountry.toUpperCase()]
      if (user?.role === 'ADMIN') {
        // Admin can request any country
        countryName = requestedName || queryCountry
      } else if (user?.country && COUNTRY_MAP[user.country] === requestedName) {
        // Regular user requesting their own country — allowed
        countryName = requestedName
      } else {
        // Regular user requesting a DIFFERENT country — DENIED
        // Force to their own country instead
        countryName = user?.country ? COUNTRY_MAP[user.country] : undefined
        if (!countryName) {
          return NextResponse.json({ districts: [] })
        }
      }
    } else {
      // No query param — read from session (HARD country isolation)
      if (user?.country) {
        countryName = COUNTRY_MAP[user.country]
      } else {
        // No session or no country → return empty, NEVER all
        return NextResponse.json({ districts: [] })
      }
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
