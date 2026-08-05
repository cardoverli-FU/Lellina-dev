'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'

interface AnalysisProgressProps {
  onAnalyze: () => void
}

interface Cloud {
  id: 'hf' | 'gemini' | 'sightengine'
  name: string
  lane: string
  description: string
}

const CLOUDS: Cloud[] = [
  { id: 'hf', name: 'HuggingFace', lane: 'Lane 2', description: 'Looking at the shape of you' },
  { id: 'gemini', name: 'Gemini', lane: 'Lane 3', description: 'Reading the light, the life, the lines' },
  { id: 'sightengine', name: 'Sightengine', lane: 'Lane 4', description: 'Sniffing for fakes, for fraud, for screens' },
]

export function AnalysisProgress({ onAnalyze }: AnalysisProgressProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const firedRef = useRef(false)

  // ─── Fire the analysis request once on mount ───
  // The three-cloud dot animation is "trust theatre" — it lights up
  // sequentially regardless of the actual fetch progress. When all three
  // are lit, the parent's onAnalyze resolves and the parent unmounts us.
  useEffect(() => {
    if (firedRef.current) return
    firedRef.current = true
    onAnalyze()
  }, [onAnalyze])

  // ─── Sequential dot animation (independent of actual fetch timing) ───
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((i) => Math.min(CLOUDS.length, i + 1))
    }, 1100)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mx-auto max-w-md w-full px-4 py-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 rounded-full border border-gold-light/30 bg-gold-light/10 px-4 py-1.5 mb-6"
      >
        <ShieldCheck className="h-3.5 w-3.5 text-gold-light" />
        <span className="font-body text-xs sm:text-sm font-medium text-cream tracking-wide">
          Step 4 · Three systems checking
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="font-display text-3xl sm:text-4xl font-black text-cream leading-[1.1] mb-3"
      >
        Three systems checking.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="font-body text-cream/75 mb-10 italic"
      >
        None remembering.
      </motion.p>

      {/* ─── Three animated cloud dots ─── */}
      <div className="space-y-3 mb-8">
        {CLOUDS.map((cloud, i) => {
          const isActive = i < activeIdx
          const isCurrent = i === activeIdx
          return (
            <motion.div
              key={cloud.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.15 }}
              className={`relative flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                isActive
                  ? 'border-warm-rose-light/40 bg-warm-rose/10'
                  : 'border-cream/10 bg-cream/[0.03]'
              }`}
            >
              {/* Status dot */}
              <div className="relative flex-shrink-0">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isActive ? '#D4889E' : 'rgba(247,244,239,0.18)',
                    scale: isCurrent ? 1.2 : 1,
                  }}
                  transition={{ duration: 0.4 }}
                  className="h-3 w-3 rounded-full"
                />
                {isCurrent && (
                  <motion.div
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                    className="absolute inset-0 h-3 w-3 rounded-full border-2 border-warm-rose-light"
                  />
                )}
              </div>

              {/* Cloud info */}
              <div className="flex-1 text-left">
                <div className="flex items-baseline gap-2">
                  <span className={`font-display text-sm font-bold ${isActive ? 'text-cream' : 'text-cream/50'}`}>
                    {cloud.name}
                  </span>
                  <span className="font-body text-[10px] text-cream/40 uppercase tracking-wider">
                    {cloud.lane}
                  </span>
                </div>
                <p className={`font-body text-xs ${isActive ? 'text-cream/70' : 'text-cream/35'}`}>
                  {cloud.description}
                </p>
              </div>

              {/* Spinner / check */}
              <div className="flex-shrink-0">
                {isCurrent ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="h-4 w-4 rounded-full border-2 border-warm-rose-light/30 border-t-warm-rose-light"
                  />
                ) : isActive ? (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="h-4 w-4 text-sage-light"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </motion.svg>
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-cream/15" />
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ─── Breathing loader below ─── */}
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="font-body text-xs text-cream/50"
      >
        Hold tight. This usually takes a few seconds.
      </motion.div>

      {/* ─── Privacy microcopy ─── */}
      <p className="mt-8 font-body text-xs text-cream/35 max-w-xs mx-auto">
        Your photo, voice, and video are gone. Only the verdict remains — and even that fades.
      </p>
    </div>
  )
}
