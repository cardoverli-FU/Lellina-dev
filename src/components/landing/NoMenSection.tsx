'use client'

import { motion } from 'framer-motion'
import { Camera, Mic, Video, ShieldCheck } from 'lucide-react'
import { SECTION_IDS } from '@/lib/lellina/constants'

/**
 * NoMenSection (Task 1.4)
 * "No men will ever join. Period."
 * Dark section. Ivory text on espresso for maximum contrast and moody drama.
 */
const STEPS = [
  {
    icon: Camera,
    label: 'Step one',
    title: 'Show your face',
    body: 'A live selfie. We see you. You see us. No filters, no fakes.',
  },
  {
    icon: Mic,
    label: 'Step two',
    title: 'Speak your truth',
    body: 'A short voice note. The pitch of your voice confirms what your face already showed.',
  },
  {
    icon: Video,
    label: 'Step three',
    title: 'Hold the code',
    body: 'A live code on camera. Liveness confirmed. No pre-recorded tricks.',
  },
  {
    icon: ShieldCheck,
    label: 'Final gate',
    title: 'The last check',
    body: 'Every signal is reviewed. If anything feels off, the gate stays closed. No exceptions.',
  },
] as const

export function NoMenSection() {
  return (
    <section
      id={SECTION_IDS.noMen}
      className="relative overflow-hidden bg-section-dark py-16 sm:py-20 lg:py-24"
    >
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center mb-14"
        >
          <p className="font-body text-sm uppercase tracking-[0.2em] text-warm-rose-light mb-3">
            The gate
          </p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-cream leading-tight">
            No men will ever join.
            <br />
            <span className="text-warm-rose-light">Period.</span>
          </h2>
          <p className="mt-5 font-body text-lg text-cream/70 max-w-2xl mx-auto">
            Every galz passes the same gate. No exceptions. No backdoors. The gate is a
            ritual — four steps, one promise: only real women get in.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative rounded-3xl border border-cream/10 bg-cream/5 backdrop-blur-sm p-6 transition-colors hover:border-warm-rose-light/40 hover:bg-cream/10"
              >
                {/* Step number */}
                <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-warm-rose text-white font-display text-sm font-bold shadow-lg">
                  {i + 1}
                </div>

                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-warm-rose/20 text-warm-rose-light">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mt-4 font-body text-xs uppercase tracking-[0.18em] text-warm-rose-light">
                  {step.label}
                </p>
                <h3 className="mt-1 font-display text-xl font-bold text-cream">
                  {step.title}
                </h3>
                <p className="mt-2 font-body text-sm text-cream/70 leading-relaxed">
                  {step.body}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Closing line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center font-body text-base sm:text-lg text-cream/60 italic"
        >
          This is not a policy. It&apos;s code.
        </motion.p>
      </div>
    </section>
  )
}
