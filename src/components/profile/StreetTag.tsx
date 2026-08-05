'use client'

import { motion } from 'framer-motion'
import { Navigation } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface StreetTagProps {
  value: string
  onChange: (val: string) => void
}

/**
 * Phase 3.5 — Street tag (neighborhood-level free text).
 * Optional — lets users add a neighborhood hint like "Sinza" or "Sea Point".
 */
export function StreetTag({ value, onChange }: StreetTagProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Step header */}
      <div className="text-center mb-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold-light/30 bg-gold-light/10 px-3 py-1 mb-3">
          <Navigation className="h-3 w-3 text-gold-light" />
          <span className="font-body text-xs font-medium text-cream tracking-wide">Step 3 of 5</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-black text-cream leading-tight">
          Drop your neighbourhood.
        </h2>
        <p className="mt-2 font-body text-sm text-cream/65 leading-relaxed">
          Optional — just a vibe check. &ldquo;Sinza&rdquo;, &ldquo;Sea Point&rdquo;, &ldquo;Kariakoo&rdquo;… you get it.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="streetTag" className="text-cream/80 font-body text-xs uppercase tracking-wider">
          Neighbourhood hint
        </Label>
        <Input
          id="streetTag"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Sinza, Sea Point, Mbagala…"
          maxLength={60}
          className="h-11 bg-cream/5 border-cream/15 text-cream placeholder:text-cream/35 focus-visible:border-warm-rose-light focus-visible:ring-warm-rose-light/30"
        />
        <p className="font-body text-[11px] text-cream/40 pl-0.5">
          {value.length}/60 — just the area, never your exact address. Skip if you want.
        </p>
      </div>
    </motion.div>
  )
}
