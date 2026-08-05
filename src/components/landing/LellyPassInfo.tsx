'use client'

import { motion } from 'framer-motion'
import { Check, Crown, Sparkles } from 'lucide-react'
import { LivePrice } from './LivePrice'
import { FREE_VS_LELLY, FOUNDING_PASS, SECTION_IDS } from '@/lib/lellina/constants'

/**
 * LellyPassInfo (Task 1.11)
 * Free vs Lelly Pass side-by-side.
 * Pricing in USD (primary) with live ZAR conversion.
 */
export function LellyPassInfo() {
  return (
    <section
      id={SECTION_IDS.lellyPass}
      className="relative bg-cream-warm py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 border border-gold/30 px-4 py-1.5 mb-4">
            <Crown className="h-3.5 w-3.5 text-gold" />
            <span className="font-body text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
              The Lelly Pass
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-soft-charcoal leading-tight">
            Browse free. <span className="text-lellina-gradient">Unlock</span> when
            you&apos;re ready.
          </h2>
          <p className="mt-5 font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse, filter, search, and match for free. When you find someone you want
            to talk to — that&apos;s when the Lelly Pass becomes the key. Not a paywall.
            A gateway to something you already want.
          </p>
        </motion.div>

        {/* Pricing summary — USD primary, ZAR live */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-10 flex max-w-xl flex-col items-center justify-center gap-6 rounded-2xl border border-border bg-white p-6 text-center sm:flex-row sm:gap-10"
        >
          <div className="flex flex-col items-center">
            <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Founding galz
            </p>
            <LivePrice usd={FOUNDING_PASS.foundingPriceUSD} variant="stacked" />
            <p className="font-body text-xs text-muted-foreground mt-1">once</p>
          </div>
          <div className="hidden sm:block h-14 w-px bg-border" />
          <div className="flex flex-col items-center">
            <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1">
              After 500 founding
            </p>
            <LivePrice usd={FOUNDING_PASS.standardPriceUSD} variant="stacked" />
            <p className="font-body text-xs text-muted-foreground mt-1">per month</p>
          </div>
        </motion.div>

        {/* Comparison table */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Free column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-border bg-white p-7 shadow-sm"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold text-soft-charcoal">Free</h3>
              <span className="rounded-full bg-muted px-3 py-1 font-body text-xs font-medium text-muted-foreground">
                Forever
              </span>
            </div>
            <ul className="space-y-3">
              {FREE_VS_LELLY.free.map((item) => (
                <li key={item.label} className="flex items-center justify-between gap-3">
                  <span className="font-body text-sm text-soft-charcoal">{item.label}</span>
                  <span className="font-body text-sm font-medium text-muted-foreground text-right">
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Lelly Pass column — highlighted */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl border-2 border-gold/50 bg-white p-7 shadow-[0_8px_40px_-12px_rgba(184,146,61,0.25)]"
          >
            {/* Recommended ribbon */}
            <div className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1 font-body text-xs font-semibold text-white shadow-md">
              <Sparkles className="h-3 w-3" />
              The unlock
            </div>

            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold text-soft-charcoal">
                Lelly Pass
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 font-body text-xs font-medium text-gold-deep">
                <Crown className="h-3 w-3" />
                Gold badge
              </span>
            </div>
            <ul className="space-y-3">
              {FREE_VS_LELLY.lelly.map((item) => (
                <li key={item.label} className="flex items-center justify-between gap-3">
                  <span className="font-body text-sm font-medium text-soft-charcoal">
                    {item.label}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-body text-sm font-semibold text-gold-deep">
                    <Check className="h-3.5 w-3.5" />
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Closing line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 text-center font-display text-xl sm:text-2xl italic text-soft-charcoal"
        >
          Not a subscription. <span className="text-lellina-gradient">A statement.</span>
        </motion.p>
      </div>
    </section>
  )
}
