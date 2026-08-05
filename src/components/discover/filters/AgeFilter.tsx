'use client'

import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

/**
 * Phase 4.9 — Age range filter (dual-thumb slider, 18–60).
 */
export function AgeFilter({
  ageMin,
  ageMax,
  onChange,
}: {
  ageMin: number
  ageMax: number
  onChange: (min: number, max: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="font-body text-xs uppercase tracking-wider text-cream/70">Age range</Label>
        <span className="font-body text-xs text-cream/50">
          {ageMin} – {ageMax === 60 ? '60+' : ageMax}
        </span>
      </div>
      <Slider
        value={[ageMin, ageMax]}
        onValueChange={(val) => onChange(val[0], val[1])}
        min={18}
        max={60}
        step={1}
        className="py-2"
      />
    </div>
  )
}
