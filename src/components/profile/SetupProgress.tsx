'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface SetupProgressProps {
  currentStep: number
  totalSteps: number
  stepLabels: string[]
}

/**
 * Phase 3.8 — Progress bar + completion gate.
 * Shows step progress with warm-rose fill. Compact, above the wizard content.
 */
export function SetupProgress({ currentStep, totalSteps, stepLabels }: SetupProgressProps) {
  const pct = Math.round(((currentStep + 1) / totalSteps) * 100)

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      {/* Progress bar */}
      <div className="relative h-1.5 w-full rounded-full bg-cream/10 overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 rounded-full bg-warm-rose"
        />
      </div>

      {/* Step dots + labels (mobile: dots only, desktop: dots + labels) */}
      <div className="flex items-center justify-between">
        {stepLabels.map((label, i) => {
          const done = i < currentStep
          const active = i === currentStep
          return (
            <div key={label} className="flex flex-col items-center gap-1">
              <div
                className={`h-2.5 w-2.5 rounded-full flex items-center justify-center transition-colors ${
                  done
                    ? 'bg-warm-rose'
                    : active
                      ? 'bg-warm-rose-light'
                      : 'bg-cream/15'
                }`}
              >
                {done && <Check className="h-1.5 w-1.5 text-white" />}
              </div>
              <span
                className={`hidden sm:block font-body text-[10px] ${
                  active ? 'text-warm-rose-light font-medium' : done ? 'text-cream/50' : 'text-cream/30'
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Percentage text */}
      <p className="mt-2 text-center font-body text-[11px] text-cream/35">
        {pct}% complete
      </p>
    </div>
  )
}
