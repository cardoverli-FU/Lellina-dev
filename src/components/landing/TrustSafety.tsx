'use client'

import { motion } from 'framer-motion'
import { ShieldOff, EyeOff, Flag, LockKeyhole } from 'lucide-react'

/**
 * TrustSafety — Tab panel: Gate (below NoMenSection)
 *
 * Ongoing safety promises beyond the verification gate.
 * Light bg (bg-ivory) → dark text per Contrast Rule.
 * No tech stack exposed. Safety framed as care, not surveillance.
 */
const SAFETY = [
  {
    icon: EyeOff,
    title: 'Nothing stored',
    body: 'Your verification never lives on a disk. It flows through the gate and is gone. Your face, your voice, your code — checked, then erased.',
  },
  {
    icon: ShieldOff,
    title: 'One strike, gone',
    body: 'A failed verification means the device and the network are banned. Appeals are reviewed by a real human — we read every one. But second accounts from the same device? Blocked.',
  },
  {
    icon: LockKeyhole,
    title: 'Handles stay hidden',
    body: 'Your Telegram, Instagram, and Signal stay invisible until you choose to share them. Your boundaries are the architecture — nothing leaks without your say.',
  },
  {
    icon: Flag,
    title: 'Report anytime',
    body: 'One tap to report — it goes straight to review, read by a real person. Your peace is one tap away, and we act fast.',
  },
] as const

export function TrustSafety() {
  return (
    <section className="relative bg-ivory py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="font-body text-sm uppercase tracking-[0.2em] text-warm-rose mb-3">
            Beyond the gate
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-soft-charcoal leading-tight">
            Safety that <span className="text-lellina-gradient">stays</span>.
          </h2>
          <p className="mt-5 font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            The gate gets you in. These four promises keep you safe once you&apos;re here.
            Every one of them, always on.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SAFETY.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`rounded-3xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 ${
                  i === SAFETY.length - 1 ? 'sm:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-warm-rose/10 text-warm-rose-dark">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-soft-charcoal">
                  {item.title}
                </h3>
                <p className="mt-2 font-body text-sm text-muted-foreground leading-relaxed">
                  {item.body}
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
          className="mt-10 text-center font-body text-base sm:text-lg text-muted-foreground italic"
        >
          Your space. Your pace. Your boundaries. Always.
        </motion.p>
      </div>
    </section>
  )
}
