'use client'

import { motion } from 'framer-motion'
import { Crown, Lock, ArrowRight } from 'lucide-react'
import { CountdownWidget } from './CountdownWidget'
import { LivePrice } from './LivePrice'
import { FOUNDING_PASS } from '@/lib/lellina/constants'

/**
 * FoundingPassSection — Tab panel: Home (below Hero)
 *
 * Founding Lelly Pass scarcity offer with live countdown (500 slots).
 * Pricing in USD (primary) with live ZAR conversion.
 * On ivory bg → dark text (high contrast).
 */
export function FoundingPassSection({ onCtaClick }: { onCtaClick?: () => void }) {
  return (
    <section className="relative bg-ivory py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 lg:items-center">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-2 self-start rounded-full bg-gold/10 border border-gold/30 px-4 py-1.5">
              <Crown className="h-4 w-4 text-gold" />
              <span className="font-body text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                Founding Galz Only
              </span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-soft-charcoal leading-[1.05]">
              500 founding galz.
              <br />
              <span className="text-lellina-gradient">One chance</span> to be first.
            </h2>

            <p className="font-body text-lg text-muted-foreground max-w-lg leading-relaxed">
              The first 500 galz lock in{' '}
              <LivePrice usd={FOUNDING_PASS.foundingPriceUSD} variant="inline" />{' '}
              — once. After that, it flips to{' '}
              <span className="font-semibold text-soft-charcoal">
                <LivePrice usd={FOUNDING_PASS.standardPriceUSD} variant="inline" />/month
              </span>{' '}
              forever. No second chances. No reruns.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={onCtaClick}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-warm-rose px-8 font-display text-base font-semibold text-white shadow-lg shadow-warm-rose/30 transition-all hover:bg-warm-rose-dark hover:scale-[1.03] hover:shadow-xl hover:shadow-warm-rose/40 active:scale-100"
              >
                Claim my founding spot
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <div className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                Private. Secure. Discreet.
              </div>
            </div>

            <p className="font-body text-sm italic text-muted-foreground">
              Not a subscription. A statement.
            </p>
          </motion.div>

          {/* Right: countdown widget */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
          >
            <CountdownWidget />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
