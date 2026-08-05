'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, AlertTriangle, Check, Loader2, RotateCcw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface VoiceCaptureProps {
  onComplete: (result: { voicePitchHz: number }) => void
}

type Phase = 'idle' | 'recording' | 'analyzing' | 'done'

const RECORDING_MS = 5000
const BAR_COUNT = 36

// Pitch thresholds per Phase 2 docs:
//   ≥165Hz → female-typical (soft signal, always show positive)
//   <100Hz → strongly male-typical (show retry prompt)
const PITCH_MALE_TYPICAL_HARD = 100

export function VoiceCapture({ onComplete }: VoiceCaptureProps) {
  const { toast } = useToast()

  const [phase, setPhase] = useState<Phase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0) // 0..1
  const [bars, setBars] = useState<number[]>(() => Array(BAR_COUNT).fill(0))
  const [pitch, setPitch] = useState<number | null>(null)
  const [lowPitchWarning, setLowPitchWarning] = useState(false)

  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number>(0)
  const pitchSamplesRef = useRef<number[]>([])

  const stopAll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try { recorderRef.current.stop() } catch { /* ignore */ }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close() } catch { /* ignore */ }
      audioCtxRef.current = null
    }
    analyserRef.current = null
    // Zero-storage: discard any recorded chunks immediately
    chunksRef.current = []
  }, [])

  // ─── Cleanup on unmount ───
  useEffect(() => {
    return () => {
      stopAll()
    }
  }, [stopAll])

  // ─── Pitch detection: autocorrelation on time-domain data ───
  const detectPitch = useCallback((buf: Float32Array, sampleRate: number): number | null => {
    const SIZE = buf.length
    let rms = 0
    for (let i = 0; i < SIZE; i++) {
      const v = buf[i]
      rms += v * v
    }
    rms = Math.sqrt(rms / SIZE)
    if (rms < 0.01) return null // silence

    // Trim to where signal crosses zero
    let r1 = 0
    let r2 = SIZE - 1
    const thres = 0.2
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buf[i]) < thres) { r1 = i; break }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break }
    }
    const trimmed = buf.slice(r1, r2)
    const newSize = trimmed.length
    if (newSize < 32) return null

    // Autocorrelation — ACF
    const c = new Float32Array(newSize).fill(0)
    for (let i = 0; i < newSize; i++) {
      for (let j = 0; j < newSize - i; j++) {
        c[i] += trimmed[j] * trimmed[j + i]
      }
    }

    // Find first dip after first peak
    let d = 0
    while (d < newSize - 1 && c[d] > c[d + 1]) d++
    let maxv = -1
    let maxp = -1
    for (let i = d; i < newSize; i++) {
      if (c[i] > maxv) {
        maxv = c[i]
        maxp = i
      }
    }
    let T0 = maxp
    if (T0 <= 0) return null

    // Parabolic interpolation for better precision
    const x1 = c[T0 - 1] ?? 0
    const x2 = c[T0]
    const x3 = c[T0 + 1] ?? 0
    const a = (x1 + x3 - 2 * x2) / 2
    const b = (x3 - x1) / 2
    if (a) T0 = T0 - b / (2 * a)

    return sampleRate / T0
  }, [])

  // ─── Finish: compute median pitch (declared before startRecording so it can be referenced in the rAF closure) ───
  const finishRecording = useCallback(() => {
    setPhase('analyzing')

    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try { recorderRef.current.stop() } catch { /* ignore */ }
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null

    // Compute median pitch (robust against outliers)
    const samples = pitchSamplesRef.current
    let medianPitch = 0
    if (samples.length > 0) {
      const sorted = [...samples].sort((a, b) => a - b)
      medianPitch = sorted[Math.floor(sorted.length / 2)]
    }

    // Stop tracks + close audio context
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close() } catch { /* ignore */ }
      audioCtxRef.current = null
    }
    analyserRef.current = null
    chunksRef.current = [] // zero-storage

    setPitch(medianPitch)

    // Soft signal: extremely low pitch (<100Hz) is strongly male-typical — prompt retry
    if (medianPitch > 0 && medianPitch < PITCH_MALE_TYPICAL_HARD) {
      setLowPitchWarning(true)
    }

    setPhase('done')

    // Auto-advance after a short beat unless low-pitch warning fires
    if (!medianPitch || medianPitch >= PITCH_MALE_TYPICAL_HARD) {
      setTimeout(() => {
        onComplete({ voicePitchHz: medianPitch })
      }, 1400)
    }
  }, [onComplete])

  // ─── Start recording ───
  const startRecording = useCallback(async () => {
    setError(null)
    setProgress(0)
    setBars(Array(BAR_COUNT).fill(0))
    setPitch(null)
    setLowPitchWarning(false)
    pitchSamplesRef.current = []
    chunksRef.current = []

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError("Your browser doesn't support microphone access. Try Chrome or Safari.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: false,
      })
      streamRef.current = stream

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      const audioCtx: AudioContext = new AudioCtx()
      audioCtxRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.7
      source.connect(analyser)
      analyserRef.current = analyser

      // MediaRecorder — we record ONLY to satisfy the liveness UX, but the
      // blob is discarded immediately after analysis (zero-storage policy).
      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        // Zero-storage: drop the audio blob immediately
        chunksRef.current = []
      }
      recorder.start()

      setPhase('recording')
      startTimeRef.current = performance.now()

      const timeData = new Float32Array(analyser.fftSize)
      const freqData = new Uint8Array(analyser.frequencyBinCount)

      const tick = () => {
        if (!analyserRef.current || !audioCtxRef.current) return

        analyserRef.current.getFloatTimeDomainData(timeData)
        analyserRef.current.getByteFrequencyData(freqData)

        // Update waveform bars
        const step = Math.floor(freqData.length / BAR_COUNT)
        const newBars: number[] = []
        for (let i = 0; i < BAR_COUNT; i++) {
          let sum = 0
          for (let j = 0; j < step; j++) {
            sum += freqData[i * step + j]
          }
          newBars.push(sum / step / 255)
        }
        setBars(newBars)

        // Pitch sample
        const p = detectPitch(timeData, audioCtxRef.current.sampleRate)
        if (p && p > 60 && p < 500) {
          pitchSamplesRef.current.push(p)
        }

        // Progress
        const elapsed = performance.now() - startTimeRef.current
        const pct = Math.min(1, elapsed / RECORDING_MS)
        setProgress(pct)
        if (pct >= 1) {
          finishRecording()
          return
        }

        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    } catch (err) {
      const name = (err as DOMException)?.name
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setError('Microphone access needed. Please allow it in your browser settings.')
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setError('No microphone found. Try a different device.')
      } else {
        setError('Could not start the microphone. Please reload the page.')
      }
    }
  }, [detectPitch, finishRecording])

  // ─── Manual "sounds great" override (the pitch is a soft signal, not a hard gate) ───
  const handleSoundsGreat = useCallback(() => {
    onComplete({ voicePitchHz: pitch ?? 0 })
  }, [onComplete, pitch])

  const handleRetry = useCallback(() => {
    setPhase('idle')
    setProgress(0)
    setBars(Array(BAR_COUNT).fill(0))
    setPitch(null)
    setLowPitchWarning(false)
    pitchSamplesRef.current = []
  }, [])

  // ─── ERROR STATE ───
  if (error) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-warm-coral/15 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-warm-coral" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-cream mb-3">Mic blocked</h2>
          <p className="font-body text-cream/70 mb-8">{error}</p>
          <button
            onClick={() => setError(null)}
            className="inline-flex h-12 items-center justify-center rounded-full bg-warm-rose px-8 font-display text-base font-semibold text-white shadow-lg shadow-warm-rose-deep/40 transition-all hover:bg-warm-rose-dark hover:scale-[1.03] active:scale-100"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-md w-full text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-gold-light/30 bg-gold-light/10 px-4 py-1.5 mb-6">
          <Mic className="h-3.5 w-3.5 text-gold-light" />
          <span className="font-body text-xs sm:text-sm font-medium text-cream tracking-wide">
            Step 2 · Voice
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-black text-cream leading-[1.1] mb-3">
          Say hi.
        </h1>
        <p className="font-body text-cream/75 mb-2 leading-relaxed">
          Five seconds. Anything you like — &quot;hi,&quot; a hum, a laugh.
        </p>
        <p className="font-body text-sm text-cream/50 mb-8 italic">
          Your voice stays yours — I just listen for the shape of real.
        </p>

        {/* ─── Waveform visualization ─── */}
        <div className="relative h-32 sm:h-40 rounded-2xl glass-dark border border-cream/10 p-4 mb-6 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center gap-[3px] px-4">
            {bars.map((v, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-full"
                style={{
                  background: phase === 'recording'
                    ? `linear-gradient(180deg, #D4889E 0%, #B8923D 100%)`
                    : 'rgba(247,244,239,0.15)',
                }}
                animate={{
                  height: phase === 'recording' ? `${Math.max(4, v * 100)}%` : '8%',
                }}
                transition={{ duration: 0.05 }}
              />
            ))}
          </div>

          {/* Progress arc / timer */}
          {phase === 'recording' && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-soft-charcoal/80 px-3 py-1 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-warm-coral animate-pulse" />
              <span className="font-body text-xs text-cream/80 tabular-nums">
                {Math.max(0, Math.ceil((RECORDING_MS - progress * RECORDING_MS) / 1000))}s left
              </span>
            </div>
          )}

          {phase === 'done' && pitch !== null && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-soft-charcoal/80 backdrop-blur-sm">
              <Check className="h-8 w-8 text-sage-light mb-2" />
              <span className="font-body text-sm text-cream/80">
                {pitch > 0 ? `${Math.round(pitch)} Hz` : 'Voice captured'}
              </span>
            </div>
          )}
        </div>

        {/* ─── Action button ─── */}
        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.button
              key="record"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={startRecording}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-warm-rose px-10 font-display text-base font-semibold text-white shadow-lg shadow-warm-rose-deep/40 transition-all hover:bg-warm-rose-dark hover:scale-[1.03] active:scale-100"
            >
              <Mic className="h-5 w-5" />
              Start recording
            </motion.button>
          )}

          {phase === 'recording' && (
            <motion.div
              key="recording"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-cream/20 bg-cream/5 px-10 font-display text-base font-semibold text-cream"
            >
              <Loader2 className="h-4 w-4 animate-spin text-warm-rose-light" />
              Listening…
            </motion.div>
          )}

          {phase === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-cream/20 bg-cream/5 px-10 font-display text-base font-semibold text-cream"
            >
              <Loader2 className="h-4 w-4 animate-spin text-gold-light" />
              Listening for the shape of real…
            </motion.div>
          )}

          {phase === 'done' && !lowPitchWarning && (
            <motion.div
              key="done-ok"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-sage-light/40 bg-sage/15 px-10 font-display text-base font-semibold text-sage-light"
            >
              <Check className="h-5 w-5" />
              Voice sounds great
            </motion.div>
          )}

          {phase === 'done' && lowPitchWarning && (
            <motion.div
              key="done-low"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="rounded-2xl border border-gold-light/30 bg-gold-light/10 p-4">
                <p className="font-body text-sm text-cream/85">
                  Hmm, that pitch sounded low. Want to try again? Speak a little higher, or hum.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleRetry}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-warm-rose px-8 font-display text-base font-semibold text-white shadow-lg shadow-warm-rose-deep/40 transition-all hover:bg-warm-rose-dark hover:scale-[1.03] active:scale-100"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try again
                </button>
                <button
                  onClick={handleSoundsGreat}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-cream/25 bg-cream/5 px-8 font-body text-sm text-cream transition-all hover:bg-cream/10"
                >
                  It&apos;s fine — continue
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-8 font-body text-xs text-cream/40 max-w-sm mx-auto">
          We never store your audio. The waveform you see fades the moment it&apos;s measured.
        </p>
      </motion.div>
    </div>
  )
}
