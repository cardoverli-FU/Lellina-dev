'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { FOUNDING_PASS, foundingSpotsRemaining } from '@/lib/lellina/constants'

/**
 * CountdownWidget — Live Founding Lelly Pass scarcity counter.
 *
 * Phase 1: optimistic client-side countdown seeded from a simulated counter.
 * Phase 7: will be wired to a real server-side counter via API.
 *
 * Behaviour:
 *  - Shows "Only [N] of 500 founding spots left"
 *  - Live ticker decreases by 1 every ~25–55s (simulated demand)
 *  - Never goes below 12 (preserves urgency without looking fake-empty)
 *  - Respects prefers-reduced-motion
 */
export function CountdownWidget({
  variant = 'default',
}: {
  variant?: 'default' | 'compact'
}) {
  const prefersReducedMotion = useReducedMotion()
  const [remaining, setRemaining] = useState<number>(foundingSpotsRemaining())

  useEffect(() => {
    if (prefersReducedMotion) return
    // Simulate live demand: a spot is claimed every 25–55 seconds.
    const tick = () => {
      setRemaining((prev) => {
        if (prev <= 12) return prev // preserve urgency floor
        return prev - 1
      })
      scheduleNext()
    }
    let timer: ReturnType<typeof setTimeout>
    const scheduleNext = () => {
      const delay = 25000 + Math.random() * 30000
      timer = setTimeout(tick, delay)
    }
    scheduleNext()
    return () => clearTimeout(timer)
  }, [prefersReducedMotion])

  const claimed = FOUNDING_PASS.totalSlots - remaining
  const claimPercent = Math.round((claimed / FOUNDING_PASS.totalSlots) * 100)

  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 border border-gold/30 px-4 py-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
        </span>
        <span className="text-sm font-body font-medium text-soft-charcoal">
          Only <span className="font-display font-bold text-gold-deep">{remaining}</span> of{' '}
          {FOUNDING_PASS.totalSlots} founding spots left
        </span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl border border-gold/30 bg-white p-6 sm:p-8 shadow-[0_8px_40px_-12px_rgba(184,146,61,0.2)]"
    >
      {/* Decorative shimmer */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent animate-shimmer" />

      <div className="relative flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold" />
          <span className="text-xs font-body uppercase tracking-[0.2em] text-gold-deep">
            Founding Lelly Pass · Live
          </span>
        </div>

        <div className="flex items-end gap-3">
          <motion.span
            key={remaining}
            initial={prefersReducedMotion ? false : { scale: 1.15, color: '#B8923D' }}
            animate={{ scale: 1, color: '#1A1614' }}
            transition={{ duration: 0.4 }}
            className="font-display text-5xl sm:text-7xl font-black leading-none text-soft-charcoal tabular-nums"
          >
            {remaining}
          </motion.span>
          <span className="font-body text-base sm:text-lg text-muted-foreground mb-2">
            of {FOUNDING_PASS.totalSlots} founding spots left
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${claimPercent}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-warm-rose via-gold to-warm-rose-dark"
          />
        </div>

        <div className="flex items-center justify-between text-xs font-body text-muted-foreground">
          <span>{claimed} galz already claimed</span>
          <span>{claimPercent}% claimed</span>
        </div>
      </div>
    </motion.div>
  )
}
