'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/ui/Logo'
import { Sparkles } from 'lucide-react'

/**
 * Hero — Tab panel: Home
 *
 * Dark espresso background with deep rose glow.
 * ALL text is BRIGHT (cream/gold-light/warm-rose-light) per the Contrast Rule.
 *
 * Public landing is geographically neutral — no city shown.
 * Primary CTA routes to /join (the country selector / verification gate).
 */
export function Hero({ onCtaClick }: { onCtaClick?: () => void }) {
  const prefersReducedMotion = useReducedMotion()
  const router = useRouter()

  return (
    <section className="relative overflow-hidden bg-hero-dark">
      {/* Floating particles — subtle gold/rose dust */}
      {!prefersReducedMotion && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="absolute block rounded-full"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: `radial-gradient(circle, ${p.color} 0%, transparent 70%)`,
                animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
                opacity: p.opacity,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        {/* Logo entrance — light variant on dark bg */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <Logo size="lg" variant="dark" />
        </motion.div>

        {/* H1 — cream on dark for max contrast */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-center font-display text-5xl sm:text-6xl lg:text-7xl font-black text-cream leading-[0.95] tracking-tight"
        >
          Galz for Galz.
        </motion.h1>

        {/* H2 — warm-rose-light (bright) on dark, neutral copy */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-4 text-center font-display italic text-xl sm:text-2xl text-warm-rose-light"
        >
          For her. By her. Only her.
        </motion.p>

        {/* Subline — cream/70 (bright) on dark */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-5 max-w-2xl mx-auto text-center font-body text-base sm:text-lg text-cream/70"
        >
          No men. No bots. No catfish. Just real women looking for real connection.
        </motion.p>

        {/* Dual CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <button
            onClick={() => router.push('/join')}
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-warm-rose px-8 font-display text-base font-semibold text-white shadow-lg shadow-warm-rose-deep/40 transition-all hover:bg-warm-rose-dark hover:scale-[1.03] hover:shadow-xl hover:shadow-warm-rose-deep/50 active:scale-100"
          >
            <Sparkles className="h-4 w-4 text-gold-light transition-transform group-hover:rotate-12" />
            Get Verified · Join Lellina
          </button>
          <button
            onClick={onCtaClick}
            className="inline-flex h-12 items-center justify-center rounded-full border border-cream/25 bg-cream/5 backdrop-blur-sm px-8 font-body text-base font-medium text-cream transition-all hover:bg-cream/15 hover:border-cream/40"
          >
            See how it works
          </button>
        </motion.div>
      </div>
    </section>
  )
}

// Static particle config (deterministic for SSR)
const PARTICLES = [
  { left: 8, top: 20, size: 12, color: 'rgba(212,175,55,0.5)', duration: 8, delay: 0, opacity: 0.4 },
  { left: 18, top: 60, size: 8, color: 'rgba(212,136,158,0.5)', duration: 10, delay: 1.5, opacity: 0.35 },
  { left: 28, top: 30, size: 14, color: 'rgba(247,244,239,0.4)', duration: 9, delay: 0.8, opacity: 0.3 },
  { left: 42, top: 75, size: 10, color: 'rgba(212,175,55,0.4)', duration: 11, delay: 2, opacity: 0.35 },
  { left: 58, top: 25, size: 13, color: 'rgba(212,136,158,0.4)', duration: 8.5, delay: 1, opacity: 0.3 },
  { left: 72, top: 65, size: 9, color: 'rgba(212,175,55,0.5)', duration: 10.5, delay: 0.5, opacity: 0.35 },
  { left: 82, top: 35, size: 11, color: 'rgba(247,244,239,0.4)', duration: 9.5, delay: 2.5, opacity: 0.3 },
  { left: 92, top: 70, size: 7, color: 'rgba(212,136,158,0.5)', duration: 8, delay: 1.2, opacity: 0.35 },
] as const
