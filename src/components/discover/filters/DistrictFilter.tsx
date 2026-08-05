'use client'

import { useEffect, useState } from 'react'
import { Check, MapPin, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'

interface District {
  id: string
  name: string
  region: string
  country: string
}

/**
 * Phase 4.10 — District multi-select filter.
 * Fetches the user's country districts automatically (country isolation).
 */
export function DistrictFilter({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  const [open, setOpen] = useState(false)
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

  return (
    <div className="space-y-2">
      <span className="font-body text-xs uppercase tracking-wider text-cream/70">District</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-cream/5 border-cream/15 text-cream hover:bg-cream/10 hover:text-cream font-body text-sm h-10"
          >
            <span className="truncate">
              {selectedNames.length > 0
                ? selectedNames.length === 1
                  ? selectedNames[0]
                  : `${selectedNames.length} districts`
                : 'All districts'}
            </span>
            <ChevronDown className="h-4 w-4 text-cream/40" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-[#1A1614] border-cream/15" align="start">
          <Command className="bg-[#1A1614] text-cream">
            <CommandList className="max-h-60">
              <CommandEmpty className="py-4 text-center font-body text-sm text-cream/40">
                No districts found.
              </CommandEmpty>
              <CommandGroup className="[&_[cmdk-group-heading]]:text-cream/50">
                {districts.map((d) => (
                  <CommandItem
                    key={d.id}
                    value={d.name}
                    onSelect={() => toggle(d.id)}
                    className="gap-2 text-cream/80 data-[selected=true]:bg-warm-rose/20 data-[selected=true]:text-cream"
                  >
                    <MapPin className="h-3 w-3 text-gold-light" />
                    <span className="flex-1 truncate font-body text-sm">{d.name}</span>
                    <Check
                      className={`h-3.5 w-3.5 text-warm-rose-light ${selected.includes(d.id) ? 'opacity-100' : 'opacity-0'}`}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
