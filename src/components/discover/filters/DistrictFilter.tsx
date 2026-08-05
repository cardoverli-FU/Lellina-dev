'use client'

import { useEffect, useState } from 'react'
import { Check, MapPin, ChevronDown, Search } from 'lucide-react'

interface District {
  id: string
  name: string
  region: string
  country: string
}

/**
 * Phase 4.10 — District multi-select filter.
 * Inline expandable list (no Popover — works inside Sheet without scroll trapping).
 */
export function DistrictFilter({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [districts, setDistricts] = useState<District[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/districts')
        const data = await res.json()
        if (!cancelled && data.districts) setDistricts(data.districts)
      } catch {
        // silent
      }
    })()
    return () => { cancelled = true }
  }, [])

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((d) => d !== id))
    } else {
      onChange([...selected, id])
    }
  }

  const selectedNames = districts
    .filter((d) => selected.includes(d.id))
    .map((d) => d.name)

  const filtered = search.trim()
    ? districts.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.country.toLowerCase().includes(search.toLowerCase())
      )
    : districts

  // Group by country
  const grouped = filtered.reduce((acc, d) => {
    if (!acc[d.country]) acc[d.country] = []
    acc[d.country].push(d)
    return acc
  }, {} as Record<string, District[]>)

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg bg-cream/5 border border-cream/15 px-3 py-2.5 text-left transition-colors hover:bg-cream/10"
      >
        <span className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-gold-light" />
          <span className="truncate font-body text-sm text-cream">
            {selectedNames.length > 0
              ? selectedNames.length === 1
                ? selectedNames[0]
                : `${selectedNames.length} districts`
              : 'All districts'}
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 text-cream/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="space-y-2 rounded-lg border border-cream/10 bg-cream/5 p-2">
          {/* Search input */}
          <div className="flex items-center gap-2 rounded-md bg-cream/5 border border-cream/10 px-2 py-1.5">
            <Search className="h-3.5 w-3.5 text-cream/40 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search districts…"
              className="w-full bg-transparent font-body text-sm text-cream placeholder:text-cream/30 outline-none"
            />
          </div>

          {/* Scrollable list */}
          <div className="max-h-52 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
            {Object.entries(grouped).map(([country, countryDistricts]) => (
              <div key={country}>
                <div className="sticky top-0 bg-[#1A1614] px-2 py-1 font-body text-[10px] uppercase tracking-wider text-cream/50 z-10">
                  {country === 'Tanzania' ? '🇹🇿' : '🇰🇪'} {country}
                </div>
                {countryDistricts.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggle(d.id)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-cream/10"
                  >
                    <MapPin className="h-3 w-3 text-gold-light shrink-0" />
                    <span className="flex-1 truncate font-body text-sm text-cream/80">{d.name}</span>
                    <Check
                      className={`h-3.5 w-3.5 text-warm-rose-light shrink-0 ${selected.includes(d.id) ? 'opacity-100' : 'opacity-0'}`}
                    />
                  </button>
                ))}
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="py-4 text-center font-body text-sm text-cream/40">
                No districts found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
