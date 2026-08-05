'use client'

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { SECTION_IDS } from '@/lib/lellina/constants'

/**
 * FounderStory (Task 1.6)
 * Anonymous founder story. Relatable. No identifying details.
 * Handwritten-feel letter format — 3 lines. Intimate, not corporate.
 */
export function FounderStory() {
  return (
    <section
      id={SECTION_IDS.founder}
      className="relative bg-off-white py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl border border-border bg-cream p-8 sm:p-12 lg:p-16 shadow-sm"
        >
          {/* Decorative quote mark */}
          <Quote
            className="absolute -top-5 left-8 h-10 w-10 text-warm-rose/30"
            fill="currentColor"
          />

          <p className="font-body text-sm uppercase tracking-[0.2em] text-warm-rose mb-6">
            A letter from the founder
          </p>

          {/* 3-line letter — handwritten feel via italic Cormorant */}
          <div className="space-y-4">
            <p className="font-display italic text-2xl sm:text-3xl lg:text-4xl text-soft-charcoal leading-snug">
              I built this because I was tired of pretending apps like this existed.
            </p>
            <p className="font-display italic text-2xl sm:text-3xl lg:text-4xl text-soft-charcoal leading-snug">
              They didn&apos;t.
            </p>
            <p className="font-display italic text-2xl sm:text-3xl lg:text-4xl text-warm-rose-dark leading-snug">
              Now they do.
            </p>
          </div>

          {/* Signature */}
          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-warm-rose/40 to-transparent" />
            <p className="font-body text-sm italic text-muted-foreground">
              — a galz, for galz
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
