'use client'

import { SlidersHorizontal, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { AgeFilter } from './filters/AgeFilter'
import { DistrictFilter } from './filters/DistrictFilter'
import { TagFilter } from './filters/TagFilter'
import { VerifiedFilter } from './filters/VerifiedFilter'

// ─── Filter state type (shared with DiscoverGrid) ───────────────────
export interface FilterState {
  ageMin: number
  ageMax: number
  districts: string[]
  tags: string[]
  verifiedOnly: boolean
}

export const DEFAULT_FILTERS: FilterState = {
  ageMin: 18,
  ageMax: 60,
  districts: [],
  tags: [],
  verifiedOnly: true,
}

interface FilterPanelProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  resultCount: number
}

/**
 * Phase 4.17 — Collapsible filter panel.
 * Combines age, district, tribe tags, and verified filters.
 * Opens as a right-side Sheet on all screen sizes.
 */
export function FilterPanel({ filters, onChange, resultCount }: FilterPanelProps) {
  const activeCount =
    (filters.ageMin !== 18 || filters.ageMax !== 60 ? 1 : 0) +
    filters.districts.length +
    filters.tags.length +
    (filters.verifiedOnly !== true ? 1 : 0)

  const reset = () => onChange({ ...DEFAULT_FILTERS })

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-cream/15 bg-cream/5 text-cream hover:bg-cream/10 hover:text-cream font-body text-sm"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-warm-rose px-1.5 font-body text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto bg-hero-dark border-cream/10 p-0 text-cream">
        <SheetHeader className="p-5 pb-3 border-b border-cream/10">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-xl font-bold text-cream">Filters</SheetTitle>
            {activeCount > 0 && (
              <button
                onClick={reset}
                className="flex items-center gap-1 font-body text-xs text-warm-rose-light hover:text-cream transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>
          <p className="font-body text-xs text-cream/50">
            {resultCount} {resultCount === 1 ? 'gal' : 'galz'} matching
          </p>
        </SheetHeader>

        <div className="p-5 space-y-6">
          <AgeFilter
            ageMin={filters.ageMin}
            ageMax={filters.ageMax}
            onChange={(min, max) => onChange({ ...filters, ageMin: min, ageMax: max })}
          />

          <DistrictFilter
            selected={filters.districts}
            onChange={(districts) => onChange({ ...filters, districts })}
          />

          <TagFilter
            selected={filters.tags}
            onChange={(tags) => onChange({ ...filters, tags })}
          />

          <VerifiedFilter
            checked={filters.verifiedOnly}
            onChange={(verifiedOnly) => onChange({ ...filters, verifiedOnly })}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
