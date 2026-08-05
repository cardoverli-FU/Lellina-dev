'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Loader2, X, Check } from 'lucide-react'

interface TribeTag {
  id: string
  name: string
  category: string
}

interface TribeTagSelectorProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

const MAX_TAGS = 5

const CATEGORY_LABELS: Record<string, string> = {
  IDENTITY: 'Who you are',
  SUBCULTURE: 'How you show up',
  SCENE: 'Where you vibe',
}

const CATEGORY_ORDER = ['IDENTITY', 'SUBCULTURE', 'SCENE']

/**
 * Phase 3.6 — Tribe tags selector (up to 5 from identity/subculture/scene categories).
 * Tags are loaded from the seeded DB. Warm, identity-affirming copy.
 */
export function TribeTagSelector({ selectedIds, onChange }: TribeTagSelectorProps) {
  const [allTags, setAllTags] = useState<TribeTag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/tribe-tags')
        const data = await res.json()
        if (!cancelled && data.tags) {
          setAllTags(data.tags)
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const toggleTag = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((t) => t !== id))
    } else if (selectedIds.length < MAX_TAGS) {
      onChange([...selectedIds, id])
    }
  }

  const tagsByCategory = CATEGORY_ORDER.reduce<Record<string, TribeTag[]>>((acc, cat) => {
    acc[cat] = allTags.filter((t) => t.category === cat)
    return acc
  }, {})

  const selectedNames = selectedIds
    .map((id) => allTags.find((t) => t.id === id)?.name)
    .filter(Boolean) as string[]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Step header */}
      <div className="text-center mb-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-warm-rose-light/30 bg-warm-rose/10 px-3 py-1 mb-3">
          <Tag className="h-3 w-3 text-warm-rose-light" />
          <span className="font-body text-xs font-medium text-cream tracking-wide">Step 4 of 5</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-black text-cream leading-tight">
          Claim your tribe.
        </h2>
        <p className="mt-2 font-body text-sm text-cream/65 leading-relaxed">
          Pick up to {MAX_TAGS} tags that say who you are. No boxes — just vibes.
        </p>
      </div>

      {/* Selected tags summary */}
      <AnimatePresence>
        {selectedNames.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {selectedNames.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1.5 rounded-full bg-warm-rose/20 border border-warm-rose-light/30 px-3 py-1 font-body text-xs font-medium text-warm-rose-light"
              >
                {name}
                <X
                  className="h-3 w-3 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                  onClick={() => {
                    const tag = allTags.find((t) => t.name === name)
                    if (tag) toggleTag(tag.id)
                  }}
                />
              </span>
            ))}
            <span className="font-body text-xs text-cream/40 self-center ml-1">
              {selectedIds.length}/{MAX_TAGS}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 text-warm-rose-light animate-spin" />
          <span className="ml-2 font-body text-sm text-cream/50">Loading tags…</span>
        </div>
      ) : (
        <div className="space-y-4">
          {CATEGORY_ORDER.map((cat) => {
            const tags = tagsByCategory[cat] || []
            if (tags.length === 0) return null
            return (
              <div key={cat}>
                <p className="font-display text-sm font-semibold text-cream/75 mb-2">
                  {CATEGORY_LABELS[cat] || cat}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const isSelected = selectedIds.includes(tag.id)
                    const isDisabled = !isSelected && selectedIds.length >= MAX_TAGS
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        disabled={isDisabled}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-body text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-warm-rose/25 border-warm-rose-light/40 text-warm-rose-light'
                            : isDisabled
                              ? 'bg-cream/3 border-cream/8 text-cream/25 cursor-not-allowed'
                              : 'bg-cream/5 border-cream/15 text-cream/65 hover:bg-cream/10 hover:border-cream/25 hover:text-cream'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                        {tag.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="font-body text-xs text-cream/40 text-center">
        These show on your profile. You can change them anytime.
      </p>
    </motion.div>
  )
}
