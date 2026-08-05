'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, MapPin, Heart, Lock } from 'lucide-react'
import { SECTION_IDS } from '@/lib/lellina/constants'

/**
 * WhyGalzSection (Task 1.3)
 * Four pillars: Verified / Local / Real / Yours.
 * No tech vocabulary. "Verified" not "AI-verified". "Real" not "biometric-checked".
 */
const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Verified',
    body: 'Every gal passes the same gate. No exceptions. No backdoors. No catfish. Ever.',
    accent: 'warm-rose',
  },
  {
    icon: MapPin,
    title: 'Present',
    body: 'Real women, really here. Not far away. Not abstract. Just present — and looking for you.',
    accent: 'sage',
  },
  {
    icon: Heart,
    title: 'Real',
    body: 'Real women. Real intentions. No filters, no performance. Just genuine connection.',
    accent: 'warm-coral',
  },
  {
    icon: Lock,
    title: 'Yours',
    body: 'Your space, your pace, your boundaries. Private by design. Discreet by default.',
    accent: 'gold',
  },
] as const

const ACCENT_MAP: Record<string, { bg: string; text: string; ring: string }> = {
  'warm-rose': { bg: 'bg-warm-rose/10', text: 'text-warm-rose-dark', ring: 'ring-warm-rose/20' },
  sage: { bg: 'bg-sage/10', text: 'text-sage', ring: 'ring-sage/20' },
  'warm-coral': { bg: 'bg-warm-coral/10', text: 'text-warm-coral', ring: 'ring-warm-coral/20' },
  gold: { bg: 'bg-gold/10', text: 'text-gold-deep', ring: 'ring-gold/20' },
}

export function WhyGalzSection() {
  return (
    <section
      id={SECTION_IDS.why}
      className="relative bg-off-white py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center mb-14"
        >
          <p className="font-body text-sm uppercase tracking-[0.2em] text-warm-rose mb-3">
            Why galz love galz
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-soft-charcoal leading-tight">
            Built different. Built for <span className="text-lellina-gradient">you</span>.
          </h2>
          <p className="mt-5 font-body text-lg text-muted-foreground">
            Four promises. Every one of them kept. Every galz who joins feels them on day one.
          </p>
        </motion.div>

        {/* Pillars grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon
            const accent = ACCENT_MAP[pillar.accent]
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative rounded-3xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${accent.bg} ${accent.text} ring-1 ${accent.ring} transition-transform group-hover:scale-110`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold text-soft-charcoal">
                  {pillar.title}
                </h3>
                <p className="mt-2 font-body text-base text-muted-foreground leading-relaxed">
                  {pillar.body}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
