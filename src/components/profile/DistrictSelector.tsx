'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface District {
  id: string
  name: string
  region: string
  country: string
}

interface DistrictSelectorProps {
  value: string
  onChange: (id: string) => void
}

/**
 * Phase 3.4 — District selector.
 * Shows districts based on the user's country (country isolation).
 * ZA users see Cape Town (8). TZ users see Dar es Salaam (5).
 */
export function DistrictSelector({ value, onChange }: DistrictSelectorProps) {
  const [districts, setDistricts] = useState<District[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/districts')
        const data = await res.json()
        if (!cancelled && data.districts) {
          setDistricts(data.districts)
        }
      } catch {
        // silent — districts will be empty
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const grouped = districts.reduce((acc, d) => {
    const key = d.country
    if (!acc[key]) acc[key] = []
    acc[key].push(d)
    return acc
  }, {} as Record<string, typeof districts>)

  const countryLabels: Record<string, string> = {
    'South Africa': '🇿🇦 Cape Town, South Africa',
    'Tanzania': '🇹🇿 Dar es Salaam, Tanzania',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Step header */}
      <div className="text-center mb-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-sage-light/30 bg-sage/10 px-3 py-1 mb-3">
          <MapPin className="h-3 w-3 text-sage-light" />
          <span className="font-body text-xs font-medium text-cream tracking-wide">Step 2 of 5</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-black text-cream leading-tight">
          Where are you based?
        </h2>
        <p className="mt-2 font-body text-sm text-cream/65 leading-relaxed">
          Pick your area so galz nearby can find you. You can always change this later.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 text-warm-rose-light animate-spin" />
          <span className="ml-2 font-body text-sm text-cream/50">Loading areas…</span>
        </div>
      ) : (
        <div className="space-y-2">
          <Label className="text-cream/80 font-body text-xs uppercase tracking-wider">
            Area
          </Label>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="h-11 bg-cream/5 border-cream/15 text-cream focus:ring-warm-rose-light/30">
              <SelectValue placeholder="Choose your area…" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1614] border-cream/15 text-cream">
              {Object.entries(grouped).map(([country, ds]) => (
                <SelectGroup key={country}>
                  <SelectLabel className="text-gold-light font-display text-xs uppercase tracking-wider">
                    {countryLabels[country] || country}
                  </SelectLabel>
                  {ds.map((d) => (
                    <SelectItem key={d.id} value={d.id} className="text-cream/80 focus:bg-warm-rose/20 focus:text-cream">
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          <p className="font-body text-[11px] text-cream/40 pl-0.5">
            This helps galz find you in Discover. Your exact location is never shared.
          </p>
        </div>
      )}
    </motion.div>
  )
}
