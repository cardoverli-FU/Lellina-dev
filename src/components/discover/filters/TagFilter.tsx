'use client'

import { useEffect, useState } from 'react'
import { Check, Tag, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandInput } from '@/components/ui/command'

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
 * Groups tags by category (Identity / Subculture / Scene).
 */
export function TagFilter({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  const [open, setOpen] = useState(false)
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

  const selectedCount = selected.length

  return (
    <div className="space-y-2">
      <span className="font-body text-xs uppercase tracking-wider text-cream/70">Tribe tags</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-cream/5 border-cream/15 text-cream hover:bg-cream/10 hover:text-cream font-body text-sm h-10"
          >
            <span className="truncate">
              {selectedCount > 0 ? `${selectedCount} tag${selectedCount > 1 ? 's' : ''}` : 'All tags'}
            </span>
            <ChevronDown className="h-4 w-4 text-cream/40" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-[#1A1614] border-cream/15" align="start">
          <Command className="bg-[#1A1614] text-cream">
            <CommandInput placeholder="Search tags…" className="text-cream border-cream/15" />
            <CommandList className="max-h-72">
              <CommandEmpty className="py-4 text-center font-body text-sm text-cream/40">
                No tags found.
              </CommandEmpty>
              {Object.entries(grouped).map(([category, catTags]) => (
                <CommandGroup key={category} heading={CATEGORY_LABELS[category] || category} className="[&_[cmdk-group-heading]]:text-cream/50">
                  {catTags.map((t) => (
                    <CommandItem
                      key={t.id}
                      value={t.name}
                      onSelect={() => toggle(t.id)}
                      className="gap-2 text-cream/80 data-[selected=true]:bg-warm-rose/20 data-[selected=true]:text-cream"
                    >
                      <Tag className="h-3 w-3 text-gold-light" />
                      <span className="flex-1 truncate font-body text-sm">{t.name}</span>
                      <Check
                        className={`h-3.5 w-3.5 text-warm-rose-light ${selected.includes(t.id) ? 'opacity-100' : 'opacity-0'}`}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
