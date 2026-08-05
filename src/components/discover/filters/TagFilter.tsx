'use client'

import { useEffect, useState } from 'react'
import { Check, Tag, ChevronDown, Search } from 'lucide-react'

interface TribeTag {
  id: string
  name: string
  category: string
}

const CATEGORY_LABELS: Record<string, string> = {
  IDENTITY: 'Identity',
  SUBCULTURE: 'Subculture',
  SCENE: 'Scene',
}

/**
 * Phase 4.11 — Tribe tag multi-select filter.
 * Inline expandable list (no Popover — works inside Sheet without scroll trapping).
 */
export function TagFilter({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [tags, setTags] = useState<TribeTag[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/tribe-tags')
        const data = await res.json()
        if (!cancelled && data.tags) setTags(data.tags)
      } catch {
        // silent
      }
    })()
    return () => { cancelled = true }
  }, [])

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((t) => t !== id))
    } else {
      onChange([...selected, id])
    }
  }

  const grouped = tags.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = []
    acc[t.category].push(t)
    return acc
  }, {} as Record<string, TribeTag[]>)

  // Filter tags by search
  const filteredGrouped = search.trim()
    ? Object.fromEntries(
        Object.entries(grouped).map(([cat, catTags]) => [
          cat,
          catTags.filter((t) => t.name.toLowerCase().includes(search.toLowerCase())),
        ]).filter(([, catTags]) => catTags.length > 0)
      )
    : grouped

  const selectedCount = selected.length

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg bg-cream/5 border border-cream/15 px-3 py-2.5 text-left transition-colors hover:bg-cream/10"
      >
        <span className="flex items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-gold-light" />
          <span className="truncate font-body text-sm text-cream">
            {selectedCount > 0 ? `${selectedCount} tag${selectedCount > 1 ? 's' : ''}` : 'All tags'}
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
              placeholder="Search tags…"
              className="w-full bg-transparent font-body text-sm text-cream placeholder:text-cream/30 outline-none"
            />
          </div>

          {/* Scrollable list */}
          <div className="max-h-64 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
            {Object.entries(filteredGrouped).map(([category, catTags]) => (
              <div key={category}>
                <div className="sticky top-0 bg-[#1A1614] px-2 py-1 font-body text-[10px] uppercase tracking-wider text-cream/50 z-10">
                  {CATEGORY_LABELS[category] || category}
                </div>
                {(catTags as TribeTag[]).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggle(t.id)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-cream/10"
                  >
                    <Tag className="h-3 w-3 text-gold-light shrink-0" />
                    <span className="flex-1 truncate font-body text-sm text-cream/80">{t.name}</span>
                    <Check
                      className={`h-3.5 w-3.5 text-warm-rose-light shrink-0 ${selected.includes(t.id) ? 'opacity-100' : 'opacity-0'}`}
                    />
                  </button>
                ))}
              </div>
            ))}
            {Object.keys(filteredGrouped).length === 0 && (
              <p className="py-4 text-center font-body text-sm text-cream/40">
                No tags found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
