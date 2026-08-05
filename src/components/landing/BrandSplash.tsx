'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * BrandSplash — Opening brand intro.
 *
 * Deep rose gradient background with the Lellina wordmark in cream + gold accent.
 * Fades out after ~1.8s. All text is BRIGHT (cream/gold) per the Contrast Rule —
 * NO dark text on this deep rose background.
 *
 * Shows once per session (sessionStorage gated).
 */
export function BrandSplash() {
  const prefersReducedMotion = useReducedMotion()
  const [show, setShow] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // If already seen this session, hide on next frame (deferred to avoid
    // synchronous setState in effect — per react-hooks/set-state-in-effect rule)
    if (sessionStorage.getItem('lellina-splash-seen') === '1') {
      const raf = requestAnimationFrame(() => setShow(false))
      return () => cancelAnimationFrame(raf)
    }

    // First visit: show splash, hide after 1.8s, mark as seen
    const timer = setTimeout(() => {
      setShow(false)
      sessionStorage.setItem('lellina-splash-seen', '1')
    }, 1800)
    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="brand-splash"
      aria-hidden
    >
      {/* Decorative gold ring */}
      <motion.div
        initial={prefersReducedMotion ? {} : { scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative flex h-32 w-32 items-center justify-center rounded-full border border-gold-light/30"
      >
        <div className="absolute inset-2 rounded-full border border-gold-light/20" />

        {/* Stylized L mark — cream on deep rose */}
        <svg viewBox="0 0 100 100" fill="none" className="h-16 w-16">
          <path
            d="M38 25V62C38 67 42 72 50 72H65"
            stroke="#FAF6F0"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="65" cy="72" r="4" fill="#D4AF37" />
        </svg>
      </motion.div>

      {/* Wordmark — cream on deep rose (BRIGHT, never dark) */}
      <motion.h1
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-8 font-display text-4xl font-bold tracking-tight text-cream"
      >
        Lellina
      </motion.h1>

      {/* Tagline — gold-light on deep rose (BRIGHT) */}
      <motion.p
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-2 font-body text-sm uppercase tracking-[0.3em] text-gold-light"
      >
        Galz for Galz
      </motion.p>

      {/* Subtle loading dots — cream, low opacity */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1 }}
        className="mt-10 flex gap-1.5"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={prefersReducedMotion ? {} : { opacity: [0.2, 0.8, 0.2] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
            className="h-1.5 w-1.5 rounded-full bg-cream"
          />
        ))}
      </motion.div>
    </motion.div>
  )
}
