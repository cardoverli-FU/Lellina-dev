'use client'

import { motion } from 'framer-motion'
import { LogOut, Clock } from 'lucide-react'

/**
 * ComingSoon — shown when a user selects a country that is NOT yet allowed
 * through the Lellina gate (i.e. anything other than Tanzania / Kenya).
 *
 * ZERO data is stored for these users:
 *   - No email collection
 *   - No form submission
 *   - No localStorage / sessionStorage writes
 *   - No API calls
 *
 * The user is simply told their country is "coming soon" and given a single
 * exit back to home. No community channels, no follow prompts — just a clean
 * goodbye until we launch in their region.
 */
export function ComingSoon({ countryName }: { countryName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-dark rounded-3xl p-6 sm:p-8"
    >
      {/* Clock badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-light/30 bg-gold-light/10"
      >
        <Clock className="h-6 w-6 text-gold-light" />
      </motion.div>

      {/* Heading — cream on dark for max contrast */}
      <h2 className="text-center font-display text-2xl sm:text-3xl font-bold text-cream leading-tight">
        Coming to your country soon
      </h2>

      {/* Body — cream/70 on dark */}
      <p className="mt-3 text-center font-body text-sm sm:text-base text-cream/70 leading-relaxed">
        We&apos;re starting in Tanzania & Kenya. We&apos;ll open{' '}
        <span className="font-semibold text-warm-rose-light">{countryName}</span>{' '}
        when the time is right. Please check back later.
      </p>

      {/* Exit button — only action offered (no channels, no follow prompts) */}
      <a
        href="/"
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-warm-rose px-8 font-display text-base font-semibold text-white shadow-lg shadow-warm-rose-deep/40 transition-all hover:bg-warm-rose-dark hover:scale-[1.02] active:scale-100"
      >
        <LogOut className="h-4 w-4 text-gold-light" />
        Exit to home
      </a>

      {/* Reassurance microcopy — cream/50 on dark */}
      <p className="mt-5 text-center font-body text-xs text-cream/50">
        We don&apos;t store your selection. You&apos;re free to check back anytime.
      </p>
    </motion.div>
  )
}
