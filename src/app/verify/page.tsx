'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ShieldCheck, Heart, Lock, ArrowRight, AlertTriangle, Ban, Clock } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { useToast } from '@/hooks/use-toast'
import { SelfieCapture } from '@/components/verify/SelfieCapture'
import { VoiceCapture } from '@/components/verify/VoiceCapture'
import { VideoCapture } from '@/components/verify/VideoCapture'
import { AnalysisProgress } from '@/components/verify/AnalysisProgress'
import { computeDeviceFingerprint } from '@/lib/device-fingerprint'

type Step = 'intro' | 'selfie' | 'voice' | 'video' | 'analyzing' | 'result'

interface SelfieResult {
  selfieBase64: string
  faceEmbedding: number[] | null
}

interface VoiceResult {
  voicePitchHz: number
}

interface VideoResult {
  videoCodeMatch: boolean
}

type FinalVerdict = 'PASS' | 'MANUAL_REVIEW' | 'BAN' | 'ERROR'

const STEP_LABELS = ['Selfie', 'Voice', 'Code', 'Verify'] as const

export default function VerifyPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [step, setStep] = useState<Step>('intro')
  const [stepIndex, setStepIndex] = useState(0)

  const [selfieResult, setSelfieResult] = useState<SelfieResult | null>(null)
  const [voiceResult, setVoiceResult] = useState<VoiceResult | null>(null)
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null)

  const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null)
  const [finalVerdict, setFinalVerdict] = useState<FinalVerdict | null>(null)
  const [verificationToken, setVerificationToken] = useState<string | null>(null)

  // ─── On mount: fire HF wake ping (cold-start killer) + compute fingerprint ───
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      // Wake HF in the background so model is warm by the time user reaches selfie capture
      try {
        await fetch('/api/verify/wake', { method: 'POST' })
      } catch {
        // Non-blocking — verification handles cold start gracefully
      }

      // Compute device fingerprint
      try {
        const fp = await computeDeviceFingerprint()
        if (!cancelled) setDeviceFingerprint(fp)
      } catch {
        // Fingerprint failure is non-fatal — we proceed with an empty hash
        if (!cancelled) setDeviceFingerprint('unknown')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleStart = useCallback(() => {
    setStep('selfie')
    setStepIndex(0)
  }, [])

  const handleSelfieCaptured = useCallback((result: SelfieResult) => {
    setSelfieResult(result)
    setStep('voice')
    setStepIndex(1)
  }, [])

  const handleVoiceComplete = useCallback((result: VoiceResult) => {
    setVoiceResult(result)
    setStep('video')
    setStepIndex(2)
  }, [])

  const handleVideoComplete = useCallback((result: VideoResult) => {
    setVideoResult(result)
    setStep('analyzing')
    setStepIndex(3)
    // The AnalysisProgress component will call onAnalyze
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!selfieResult || !voiceResult || !videoResult || !deviceFingerprint) {
      toast({
        title: 'Missing data',
        description: 'Something went wrong. Please start over.',
        variant: 'destructive',
      })
      return
    }

    try {
      const res = await fetch('/api/verify/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selfieBase64: selfieResult.selfieBase64,
          deviceFingerprint,
          voicePitchHz: voiceResult.voicePitchHz,
          videoCodeMatch: videoResult.videoCodeMatch,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setFinalVerdict('ERROR')
        if (data.attemptsRemaining !== undefined) {
          toast({
            title: 'Verification paused',
            description: `Too many attempts. Try again later. (${data.attemptsRemaining} attempts remaining.)`,
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Verification error',
            description: data.error || 'Please try again in a moment.',
            variant: 'destructive',
          })
        }
        setStep('result')
        return
      }

      if (data.verdict === 'PASS') {
        setFinalVerdict('PASS')
        setVerificationToken(data.verificationToken)
      } else if (data.verdict === 'BAN') {
        setFinalVerdict('BAN')
      } else {
        setFinalVerdict('MANUAL_REVIEW')
      }
      setStep('result')
    } catch {
      setFinalVerdict('ERROR')
      toast({
        title: 'Network error',
        description: 'Could not reach verification. Check your connection and try again.',
        variant: 'destructive',
      })
      setStep('result')
    }
  }, [selfieResult, voiceResult, videoResult, deviceFingerprint, toast])

  const handleRetry = useCallback(() => {
    setSelfieResult(null)
    setVoiceResult(null)
    setVideoResult(null)
    setFinalVerdict(null)
    setVerificationToken(null)
    setStep('intro')
    setStepIndex(0)
  }, [])

  // ─── On PASS, redirect to /register with token ───
  useEffect(() => {
    if (step === 'result' && finalVerdict === 'PASS' && verificationToken) {
      const timer = setTimeout(() => {
        router.push(`/register?token=${verificationToken}`)
      }, 1800)
      return () => clearTimeout(timer)
    }
  }, [step, finalVerdict, verificationToken, router])

  return (
    <main className="min-h-screen bg-hero-dark">
      {/* ─── Progress Dots (4 steps, only shown after intro) ─── */}
      {step !== 'intro' && step !== 'result' && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-soft-charcoal/80 backdrop-blur-md border-b border-cream/10">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
            <Logo size="sm" variant="dark" />
            <div className="flex items-center gap-2">
              {STEP_LABELS.map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: i === stepIndex ? 1.15 : 1,
                      backgroundColor: i <= stepIndex ? '#D4889E' : 'rgba(247,244,239,0.18)',
                    }}
                    className="h-2.5 w-2.5 rounded-full"
                  />
                  <span
                    className={`hidden sm:inline font-body text-xs ${
                      i === stepIndex ? 'text-warm-rose-light' : 'text-cream/40'
                    }`}
                  >
                    {label}
                  </span>
                  {i < STEP_LABELS.length - 1 && (
                    <div className="hidden sm:block h-px w-6 bg-cream/15" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ─── INTRO ─── */}
        {step === 'intro' && (
          <motion.section
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 sm:px-6"
          >
            <IntroScreen onStart={handleStart} deviceReady={!!deviceFingerprint} />
          </motion.section>
        )}

        {/* ─── STEP 1: SELFIE ─── */}
        {step === 'selfie' && (
          <motion.section
            key="selfie"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative min-h-screen pt-16"
          >
            <SelfieCapture onCapture={handleSelfieCaptured} />
          </motion.section>
        )}

        {/* ─── STEP 2: VOICE ─── */}
        {step === 'voice' && (
          <motion.section
            key="voice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative min-h-screen pt-16"
          >
            <VoiceCapture onComplete={handleVoiceComplete} />
          </motion.section>
        )}

        {/* ─── STEP 3: VIDEO CODE ─── */}
        {step === 'video' && (
          <motion.section
            key="video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative min-h-screen pt-16"
          >
            <VideoCapture onComplete={handleVideoComplete} />
          </motion.section>
        )}

        {/* ─── STEP 4: ANALYZING ─── */}
        {step === 'analyzing' && (
          <motion.section
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative min-h-screen flex items-center justify-center pt-16"
          >
            <AnalysisProgress onAnalyze={handleAnalyze} />
          </motion.section>
        )}

        {/* ─── RESULT ─── */}
        {step === 'result' && (
          <motion.section
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative min-h-screen flex items-center justify-center pt-16"
          >
            <ResultScreen verdict={finalVerdict} onRetry={handleRetry} />
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  )
}

// ════════════════════════════════════════════════════════════════════
// INTRO SCREEN
// ════════════════════════════════════════════════════════════════════
function IntroScreen({ onStart, deviceReady }: { onStart: () => void; deviceReady: boolean }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-center mb-8"
      >
        <Logo size="lg" variant="dark" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="inline-flex items-center gap-2 rounded-full border border-gold-light/30 bg-gold-light/10 px-4 py-1.5 mb-6"
      >
        <ShieldCheck className="h-3.5 w-3.5 text-gold-light" />
        <span className="font-body text-xs sm:text-sm font-medium text-cream tracking-wide">
          The Gate · Four breaths
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25 }}
        className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-cream leading-[1.05] tracking-tight"
      >
        Selfie. Voice. Code. Done.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35 }}
        className="mt-6 font-body text-base sm:text-lg text-cream/75 leading-relaxed"
      >
        We over-check because you matter. Bots can&apos;t buy their way in. Neither can men.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45 }}
        className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        <Pillar icon={<Heart className="h-4 w-4 text-warm-rose-light" />} title="Selfie" desc="A real face, looked at." />
        <Pillar icon={<Sparkles className="h-4 w-4 text-gold-light" />} title="Voice" desc="Five seconds of you." />
        <Pillar icon={<Lock className="h-4 w-4 text-sage-light" />} title="Code" desc="Read aloud, prove you're here." />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.55 }}
        className="mt-10"
      >
        <button
          onClick={onStart}
          disabled={!deviceReady}
          className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-warm-rose px-8 font-display text-base font-semibold text-white shadow-lg shadow-warm-rose-deep/40 transition-all hover:bg-warm-rose-dark hover:scale-[1.03] hover:shadow-xl hover:shadow-warm-rose-deep/50 active:scale-100 disabled:opacity-60 disabled:hover:scale-100"
        >
          <ShieldCheck className="h-4 w-4 text-gold-light" />
          Start my verification
          <ArrowRight className="h-4 w-4 text-white transition-transform group-hover:translate-x-0.5" />
        </button>
        <p className="mt-4 font-body text-xs text-cream/45">
          {deviceReady ? 'Secure · 4 steps · ~90 seconds' : 'Preparing secure session…'}
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.7 }}
        className="mt-10 font-body text-xs text-cream/40 max-w-md mx-auto"
      >
        We never store your photo, voice, or video. We look, we forget. Only a verdict remains — and even that fades.
      </motion.p>
    </div>
  )
}

function Pillar({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="glass-dark rounded-2xl p-4 text-left">
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="font-display text-sm font-semibold text-cream">{title}</span>
      </div>
      <p className="font-body text-xs text-cream/60 leading-snug">{desc}</p>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// RESULT SCREEN
// ════════════════════════════════════════════════════════════════════
function ResultScreen({ verdict, onRetry }: { verdict: FinalVerdict | null; onRetry: () => void }) {
  if (verdict === 'PASS') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-md text-center px-4"
      >
        <div className="relative mx-auto mb-8 h-24 w-24">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="absolute inset-0 rounded-full bg-sage/20 flex items-center justify-center"
          >
            <ShieldCheck className="h-12 w-12 text-sage-light" />
          </motion.div>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 1.2, delay: 0.4, repeat: Infinity }}
            className="absolute inset-0 rounded-full border-2 border-sage-light"
          />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-black text-cream mb-3">You&apos;re in.</h1>
        <p className="font-body text-cream/75 mb-2">Three systems said yes. None of them will remember.</p>
        <p className="font-body text-sm text-cream/50">Taking you to claim your account…</p>
      </motion.div>
    )
  }

  if (verdict === 'MANUAL_REVIEW') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-md text-center px-4"
      >
        <div className="mx-auto mb-8 h-24 w-24 rounded-full bg-gold-light/15 flex items-center justify-center">
          <Clock className="h-12 w-12 text-gold-light" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-black text-cream mb-3">Hold tight, gal.</h1>
        <p className="font-body text-cream/75 mb-8">
          Something didn&apos;t line up perfectly. A real human (one of us) will take a closer look. You can also appeal —
          we read every one.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="mailto:hello@lellina.app?subject=Verification Appeal"
            className="inline-flex h-12 items-center justify-center rounded-full bg-warm-rose px-8 font-display text-base font-semibold text-white shadow-lg shadow-warm-rose-deep/40 transition-all hover:bg-warm-rose-dark hover:scale-[1.03] active:scale-100"
          >
            Appeal this decision
          </a>
          <button
            onClick={onRetry}
            className="inline-flex h-11 items-center justify-center rounded-full border border-cream/25 bg-cream/5 px-6 font-body text-sm text-cream transition-all hover:bg-cream/10"
          >
            Try again instead
          </button>
        </div>
      </motion.div>
    )
  }

  if (verdict === 'BAN') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-md text-center px-4"
      >
        <div className="mx-auto mb-8 h-24 w-24 rounded-full bg-warm-coral/20 flex items-center justify-center">
          <Ban className="h-12 w-12 text-warm-coral" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-black text-cream mb-3">Not this time.</h1>
        <p className="font-body text-cream/75 mb-8">
          The systems couldn&apos;t confirm you belong here. If we got it wrong, appeal — we read every one personally.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="mailto:hello@lellina.app?subject=Verification Appeal"
            className="inline-flex h-12 items-center justify-center rounded-full bg-warm-rose px-8 font-display text-base font-semibold text-white shadow-lg shadow-warm-rose-deep/40 transition-all hover:bg-warm-rose-dark hover:scale-[1.03] active:scale-100"
          >
            Appeal this decision
          </a>
          <button
            onClick={onRetry}
            className="inline-flex h-11 items-center justify-center rounded-full border border-cream/25 bg-cream/5 px-6 font-body text-sm text-cream transition-all hover:bg-cream/10"
          >
            Try again
          </button>
        </div>
      </motion.div>
    )
  }

  // ERROR
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-md text-center px-4"
    >
      <div className="mx-auto mb-8 h-24 w-24 rounded-full bg-gold-light/15 flex items-center justify-center">
        <AlertTriangle className="h-12 w-12 text-gold-light" />
      </div>
      <h1 className="font-display text-4xl sm:text-5xl font-black text-cream mb-3">Hiccup.</h1>
      <p className="font-body text-cream/75 mb-8">
        Something went sideways — could be a network blip, could be too many attempts too fast. Catch your breath and
        try again.
      </p>
      <button
        onClick={onRetry}
        className="inline-flex h-12 items-center justify-center rounded-full bg-warm-rose px-8 font-display text-base font-semibold text-white shadow-lg shadow-warm-rose-deep/40 transition-all hover:bg-warm-rose-dark hover:scale-[1.03] active:scale-100"
      >
        Start over
      </button>
    </motion.div>
  )
}
