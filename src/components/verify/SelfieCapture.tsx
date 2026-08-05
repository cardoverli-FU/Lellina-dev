'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, SwitchCamera, AlertTriangle, Check, Loader2, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SelfieCaptureProps {
  onCapture: (result: { selfieBase64: string; faceEmbedding: number[] | null }) => void
}

type FaceFeedback = {
  status: 'no-face' | 'too-far' | 'low-light' | 'perfect' | 'loading' | 'error'
  message: string
}

const FEEDBACK_COLORS: Record<FaceFeedback['status'], { dot: string; text: string; bg: string }> = {
  'no-face': { dot: 'bg-warm-coral', text: 'text-warm-coral', bg: 'bg-warm-coral/15' },
  'too-far': { dot: 'bg-gold-light', text: 'text-gold-light', bg: 'bg-gold-light/15' },
  'low-light': { dot: 'bg-gold-light', text: 'text-gold-light', bg: 'bg-gold-light/15' },
  'perfect': { dot: 'bg-sage-light', text: 'text-sage-light', bg: 'bg-sage-light/15' },
  'loading': { dot: 'bg-cream/50', text: 'text-cream/70', bg: 'bg-cream/5' },
  'error': { dot: 'bg-warm-coral', text: 'text-warm-coral', bg: 'bg-warm-coral/15' },
}

const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models'

// Auto-capture: when face is sustained 'perfect' for this long, capture fires automatically.
// No button tap needed. Manual tap still works as a fallback.
const AUTO_CAPTURE_MS = 2500

export function SelfieCapture({ onCapture }: SelfieCaptureProps) {
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const faceapiRef = useRef<any>(null)

  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [faceFeedback, setFaceFeedback] = useState<FaceFeedback>({
    status: 'loading',
    message: 'Warming up the camera…',
  })
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [capturing, setCapturing] = useState(false)
  const [captured, setCaptured] = useState(false)
  const [countdownProgress, setCountdownProgress] = useState(0) // 0..1 — drives the auto-capture ring

  // Refs for auto-capture (avoids stale closures in the rAF detect loop)
  const perfectSinceRef = useRef<number | null>(null)
  const countdownProgressRef = useRef(0)

  // ─── Load modern-face-api models ───
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const faceapi = await import('modern-face-api')
        faceapiRef.current = faceapi
        // tinyFaceDetector (~190KB) for speed; faceLandmark68Net + faceRecognitionNet for 128-dim embedding
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ])
        if (!cancelled) setModelsLoaded(true)
      } catch {
        if (!cancelled) {
          // Models didn't load — we'll still allow capture, just skip the embedding step
          setModelsLoaded(false)
          toast({
            title: 'Face models unavailable',
            description: 'Continuing without real-time guidance. Your selfie will still be checked.',
          })
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [toast])

  // ─── Start camera ───
  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
    setCameraError(null)
    setCameraReady(false)

    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }

    // Check API support
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("Your browser doesn't support camera access. Try Chrome or Safari.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
      setCameraReady(true)
      setFaceFeedback({ status: 'loading', message: 'Looking for your face…' })
    } catch (err) {
      const name = (err as DOMException)?.name
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setCameraError('Camera access needed. Please allow it in your browser settings.')
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setCameraError('No camera found. Try a different device.')
      } else if (name === 'NotReadableError') {
        setCameraError('Camera is in use by another app. Close it and try again.')
      } else {
        setCameraError('Could not start the camera. Please reload the page.')
      }
    }
  }, [])

  useEffect(() => {
    startCamera(facingMode)
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [facingMode, startCamera])

  // ─── Real-time face detection loop ───
  useEffect(() => {
    if (!cameraReady || !modelsLoaded || !faceapiRef.current) return
    const faceapi = faceapiRef.current
    const video = videoRef.current
    if (!video) return

    let lastFeedbackUpdate = 0
    let lastBrightness = 0

    const detect = async () => {
      if (!video || video.readyState !== 4) {
        rafRef.current = requestAnimationFrame(detect)
        return
      }

      try {
        const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        const detection = await faceapi.detectSingleFace(video, options)

        const now = performance.now()

        // ─── Determine status every frame (auto-capture needs per-frame precision) ───
        let currentStatus: FaceFeedback['status'] = 'no-face'
        let currentMessage = 'No face detected'

        if (detection) {
          const box = detection.box
          const videoArea = video.videoWidth * video.videoHeight
          const faceArea = box.width * box.height
          const faceRatio = faceArea / videoArea

          // Brightness check via a tiny canvas sample
          let brightness = lastBrightness
          try {
            const c = document.createElement('canvas')
            c.width = 32
            c.height = 32
            const cx = c.getContext('2d', { willReadFrequently: true })
            if (cx) {
              cx.drawImage(video, 0, 0, 32, 32)
              const data = cx.getImageData(0, 0, 32, 32).data
              let sum = 0
              for (let i = 0; i < data.length; i += 4) {
                sum += (data[i] + data[i + 1] + data[i + 2]) / 3
              }
              brightness = sum / (data.length / 4)
              lastBrightness = brightness
            }
          } catch {
            // ignore
          }

          if (faceRatio < 0.05) {
            currentStatus = 'too-far'
            currentMessage = 'Move closer'
          } else if (brightness < 50) {
            currentStatus = 'low-light'
            currentMessage = 'More light on your face'
          } else if (faceRatio > 0.45) {
            currentStatus = 'too-far'
            currentMessage = 'A little further back'
          } else {
            currentStatus = 'perfect'
            currentMessage = countdownProgressRef.current > 0
              ? 'Hold still — capturing…'
              : 'Perfect — hold still'
          }
        }

        // Throttled faceFeedback update (every 250ms — avoids UI jitter)
        if (now - lastFeedbackUpdate > 250) {
          lastFeedbackUpdate = now
          setFaceFeedback({ status: currentStatus, message: currentMessage })
        }

        // ─── Auto-capture: count up while face is sustained 'perfect' ───
        if (currentStatus === 'perfect') {
          if (perfectSinceRef.current === null) {
            perfectSinceRef.current = now
          }
          const elapsed = now - perfectSinceRef.current
          const pct = Math.min(1, elapsed / AUTO_CAPTURE_MS)
          // Only update state if progress changed meaningfully (avoids re-render spam)
          if (Math.abs(pct - countdownProgressRef.current) > 0.008) {
            countdownProgressRef.current = pct
            setCountdownProgress(pct)
          }
        } else {
          // Face left the 'perfect' zone — reset the countdown
          if (countdownProgressRef.current > 0) {
            countdownProgressRef.current = 0
            setCountdownProgress(0)
          }
          perfectSinceRef.current = null
        }
      } catch {
        // Detection errors are non-fatal — skip frame
      }

      rafRef.current = requestAnimationFrame(detect)
    }

    rafRef.current = requestAnimationFrame(detect)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [cameraReady, modelsLoaded])

  // ─── Capture selfie + compute 128-dim embedding ───
  // NOTE: MUST be declared BEFORE the effects that reference it, otherwise
  // the dependency array below hits a Temporal Dead Zone (TDZ) ReferenceError
  // at render time — which crashes the whole component on mount.
  const handleCapture = useCallback(async () => {
    if (capturing || captured) return
    const video = videoRef.current
    if (!video || video.readyState !== 4) return

    setCapturing(true)

    try {
      // Downscale to ≤1024px JPEG (target ≤2MB before base64)
      const targetMax = 1024
      let w = video.videoWidth
      let h = video.videoHeight
      const scale = Math.min(1, targetMax / Math.max(w, h))
      w = Math.round(w * scale)
      h = Math.round(h * scale)

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas unavailable')
      ctx.drawImage(video, 0, 0, w, h)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)

      // Compute 128-dim face embedding (for night-trap use later)
      let faceEmbedding: number[] | null = null
      if (modelsLoaded && faceapiRef.current) {
        try {
          const faceapi = faceapiRef.current
          const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })
          const result = await faceapi
            .detectSingleFace(video, options)
            .withFaceLandmarks()
            .withFaceDescriptor()
          if (result?.descriptor) {
            faceEmbedding = Array.from(result.descriptor as Float32Array)
          }
        } catch {
          // Non-fatal — embedding is optional at this stage
        }
      }

      setCaptured(true)
      // Brief beat for the visual feedback, then hand off
      setTimeout(() => {
        onCapture({ selfieBase64: dataUrl, faceEmbedding })
      }, 350)
    } catch {
      setCapturing(false)
      toast({
        title: 'Capture failed',
        description: 'Could not capture your selfie. Try again.',
        variant: 'destructive',
      })
    }
  }, [capturing, captured, modelsLoaded, onCapture, toast])

  // ─── Fire auto-capture when countdown completes ───
  // (separate effect so it has fresh `capturing` / `captured` / `handleCapture`)
  useEffect(() => {
    if (countdownProgress >= 1 && !capturing && !captured) {
      perfectSinceRef.current = null
      countdownProgressRef.current = 0
      handleCapture()
    }
  }, [countdownProgress, capturing, captured, handleCapture])

  // ─── Reset countdown when capturing/captured (prevents re-trigger) ───
  useEffect(() => {
    if (capturing || captured) {
      perfectSinceRef.current = null
      countdownProgressRef.current = 0
      setCountdownProgress(0)
    }
  }, [capturing, captured])

  // ─── Switch front/back camera ───
  const handleFlipCamera = useCallback(() => {
    setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))
  }, [])

  const feedbackColor = FEEDBACK_COLORS[faceFeedback.status]

  // ─── ERROR STATE ───
  if (cameraError) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-warm-coral/15 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-warm-coral" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-cream mb-3">Camera blocked</h2>
          <p className="font-body text-cream/70 mb-8">{cameraError}</p>
          <button
            onClick={() => startCamera(facingMode)}
            className="inline-flex h-12 items-center justify-center rounded-full bg-warm-rose px-8 font-display text-base font-semibold text-white shadow-lg shadow-warm-rose-deep/40 transition-all hover:bg-warm-rose-dark hover:scale-[1.03] active:scale-100"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[85vh] flex flex-col">
      {/* ─── Full-bleed viewfinder ─── */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-soft-charcoal">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
        />

        {/* Soft oval face-guide overlay (CSS, not a hard mask) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-[68vw] max-w-[340px] aspect-[3/4] rounded-[50%] border-2 border-cream/30"
            style={{
              boxShadow:
                '0 0 0 9999px rgba(20, 16, 14, 0.55), inset 0 0 60px rgba(20, 16, 14, 0.35)',
            }}
          />
        </div>

        {/* Top corner controls */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-soft-charcoal/60 backdrop-blur-md border border-cream/15 text-cream">
            <Camera className="h-5 w-5" />
          </div>
          <button
            onClick={handleFlipCamera}
            aria-label="Switch camera"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-soft-charcoal/60 backdrop-blur-md border border-cream/15 text-cream transition-all hover:bg-soft-charcoal/80 active:scale-95"
          >
            <SwitchCamera className="h-5 w-5" />
          </button>
        </div>

        {/* Loading shimmer while camera warms */}
        {!cameraReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-soft-charcoal z-20">
            <Loader2 className="h-8 w-8 text-warm-rose-light animate-spin" />
            <p className="mt-3 font-body text-sm text-cream/70">Warming up the camera…</p>
          </div>
        )}

        {/* Captured flash */}
        <AnimatePresence>
          {captured && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white z-30 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>

      {/* ─── Bottom controls: feedback + capture + microcopy ─── */}
      <div className="relative z-10 bg-gradient-to-t from-soft-charcoal via-soft-charcoal/95 to-soft-charcoal/0 px-4 pb-8 pt-6 -mt-32">
        <div className="mx-auto max-w-md flex flex-col items-center">
          {/* Real-time feedback bar */}
          <div
            className={`inline-flex items-center gap-2 rounded-full ${feedbackColor.bg} border border-cream/10 px-4 py-1.5 mb-5 transition-colors`}
          >
            <span className={`h-2 w-2 rounded-full ${feedbackColor.dot} ${faceFeedback.status === 'perfect' ? 'animate-pulse' : ''}`} />
            <span className={`font-body text-xs sm:text-sm font-medium ${feedbackColor.text}`}>
              {faceFeedback.message}
            </span>
          </div>

          {/* Capture button with auto-capture countdown ring */}
          <div className="relative h-[88px] w-[88px] flex items-center justify-center">
            {/* Auto-capture countdown ring (SVG) */}
            {countdownProgress > 0 && countdownProgress < 1 && !captured && (
              <svg className="absolute inset-0 -rotate-90 pointer-events-none" viewBox="0 0 88 88">
                <circle cx="44" cy="44" r="42" fill="none" stroke="rgba(247,244,239,0.12)" strokeWidth="2" />
                <circle
                  cx="44"
                  cy="44"
                  r="42"
                  fill="none"
                  stroke="#D4889E"
                  strokeWidth="3"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - countdownProgress)}
                  strokeLinecap="round"
                  className="transition-[stroke-dashoffset] duration-75 ease-linear"
                />
              </svg>
            )}
            <button
              onClick={handleCapture}
              disabled={!cameraReady || capturing || captured}
              aria-label="Capture selfie"
              className="group relative h-[72px] w-[72px] rounded-full border-4 border-cream/80 bg-warm-rose shadow-2xl shadow-warm-rose-deep/50 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              {capturing ? (
                <Loader2 className="h-7 w-7 text-white animate-spin absolute inset-0 m-auto" />
              ) : captured ? (
                <Check className="h-8 w-8 text-white absolute inset-0 m-auto" />
              ) : countdownProgress >= 1 ? (
                <Loader2 className="h-7 w-7 text-white animate-spin absolute inset-0 m-auto" />
              ) : (
                <span className="absolute inset-2 rounded-full bg-warm-rose-dark group-hover:bg-warm-rose-deep transition-colors" />
              )}
            </button>
          </div>

          <p className="mt-5 font-display italic text-base sm:text-lg text-cream/80 text-center">
            Let me see you. Just you.
          </p>
          <p className="mt-1 font-body text-xs text-cream/45 text-center max-w-xs">
            {countdownProgress > 0 && countdownProgress < 1
              ? 'Hold still — capturing in a moment…'
              : 'I look, I forget. Your photo never leaves this session.'}
          </p>

          {modelsLoaded === false && cameraReady && (
            <p className="mt-3 font-body text-xs text-gold-light/80 text-center">
              <X className="inline h-3 w-3 mr-1" />
              Real-time guidance unavailable — capture still works.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
