import { NextResponse } from 'next/server'

/**
 * Exchange Rate API — Live USD → ZAR via Frankfurter.app
 * Free, open-source, no API key required.
 * https://frankfurter.app
 *
 * In-memory cache: 1 hour TTL (Frankfurter updates daily on business days)
 * Fallback rate if API fails: 18.0 (conservative buffer)
 */

interface RateCache {
  rate: number
  timestamp: number
  date: string
}

let cache: RateCache | null = null
const CACHE_TTL = 60 * 60 * 1000 // 1 hour
const FALLBACK_RATE = 18.0 // conservative fallback if API is unreachable

export async function GET() {
  // Return cached rate if still fresh
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json({
      rate: cache.rate,
      date: cache.date,
      cached: true,
      source: 'frankfurter.app',
    })
  }

  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=ZAR', {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      throw new Error(`Frankfurter API responded ${res.status}`)
    }

    const data = await res.json()
    const rate = data?.rates?.ZAR

    if (typeof rate !== 'number' || rate <= 0) {
      throw new Error('Invalid rate from Frankfurter API')
    }

    cache = {
      rate,
      timestamp: Date.now(),
      date: data.date ?? new Date().toISOString().split('T')[0],
    }

    return NextResponse.json({
      rate: cache.rate,
      date: cache.date,
      cached: false,
      source: 'frankfurter.app',
    })
  } catch (error) {
    // Graceful fallback — never break the page over exchange rates
    const fallbackRate = cache?.rate ?? FALLBACK_RATE
    return NextResponse.json({
      rate: fallbackRate,
      date: cache?.date ?? new Date().toISOString().split('T')[0],
      cached: false,
      fallback: true,
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
