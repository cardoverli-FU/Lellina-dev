'use client'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { BadgeCheck } from 'lucide-react'

/**
 * Phase 4.13 — Verified-only filter (toggle, default ON).
 */
export function VerifiedFilter({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <BadgeCheck className="h-4 w-4 text-gold-light" />
        <Label className="font-body text-sm text-cream/80 cursor-pointer">Verified only</Label>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
