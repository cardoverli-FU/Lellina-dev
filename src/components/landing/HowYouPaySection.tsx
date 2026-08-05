'use client'

import { motion } from 'framer-motion'
import { Lock, Eye, Heart } from 'lucide-react'
import { SECTION_IDS } from '@/lib/lellina/constants'

/**
 * HowYouPaySection (Task 1.10)
 * Privacy-focused. NO specific gateway. NO prices. Just: "Private. Secure. Discreet."
 * Per docs: "When we launch" framing only.
 */
const PROMISES = [
  {
    icon: Lock,
    title: 'Private',
    body: 'No public statements. No awkward labels on your statement. Just a quiet key to a space that\u2019s already yours.',
  },
  {
    icon: Eye,
    title: 'Secure',
    body: 'Your boundary is the architecture. Nothing leaks. Nothing crosses without your say-so.',
  },
  {
    icon: Heart,
    title: 'Discreet',
    body: 'Built for galz who value their peace. Your business stays your business. Always.',
  },
] as const

export function HowYouPaySection() {
  return (
    <section
      id={SECTION_IDS.howYouPay}
      className="relative bg-off-white py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="font-body text-sm uppercase tracking-[0.2em] text-warm-rose mb-3">
            How you pay
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-soft-charcoal leading-tight">
            Private. Secure. <span className="text-lellina-gradient">Discreet.</span>
          </h2>
          <p className="mt-5 font-body text-lg text-muted-foreground max-w-xl mx-auto">
            When we launch, your Lelly Pass is yours to claim. No public statements.
            No awkward labels. Just a key to a space that&apos;s already yours.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PROMISES.map((promise, i) => {
            const Icon = promise.icon
            return (
              <motion.div
                key={promise.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-3xl border border-border bg-cream p-6 text-center"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-warm-rose/10 text-warm-rose-dark">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-soft-charcoal">
                  {promise.title}
                </h3>
                <p className="mt-2 font-body text-sm text-muted-foreground leading-relaxed">
                  {promise.body}
                </p>
              </motion.div>
            )
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 text-center font-body text-sm text-muted-foreground italic"
        >
          The gateway will be revealed when we launch. For now, your Founding spot is
          reserved — not charged.
        </motion.p>
      </div>
    </section>
  )
}
