'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Loader2, PartyPopper, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

import { BasicInfo, type BasicInfoData } from '@/components/profile/BasicInfo'
import { DistrictSelector } from '@/components/profile/DistrictSelector'
import { StreetTag } from '@/components/profile/StreetTag'
import { TribeTagSelector } from '@/components/profile/TribeTagSelector'
import { SocialHandles, type SocialHandlesData } from '@/components/profile/SocialHandles'
import { PhotoUpload } from '@/components/profile/PhotoUpload'
import { SetupProgress } from '@/components/profile/SetupProgress'

type WizardStep = 'basic' | 'district' | 'tags' | 'handles' | 'photos'

const STEPS: WizardStep[] = ['basic', 'district', 'tags', 'handles', 'photos']
const STEP_LABELS = ['Name', 'Location', 'Tags', 'Handles', 'Photos']

const INITIAL_BASIC: BasicInfoData = { displayName: '', age: '', bio: '' }
const INITIAL_HANDLES: SocialHandlesData = { telegram: '', instagram: '', signal: '', other: '' }

/**
 * Phase 3.1 — Profile setup wizard (multi-step).
 *
 * Guided, warm onboarding that makes new users feel welcomed,
 * not interrogated. Each step saves progress to the API.
 *
 * Flow: Basic Info → District → Tribe Tags → Social Handles → Photos → Done!
 */
export default function ProfileSetupPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [stepIndex, setStepIndex] = useState(0)
  const currentStep = STEPS[stepIndex]

  // Step data
  const [basic, setBasic] = useState<BasicInfoData>(INITIAL_BASIC)
  const [districtId, setDistrictId] = useState('')
  const [streetTag, setStreetTag] = useState('')
  const [tribeTags, setTribeTags] = useState<string[]>([])
  const [handles, setHandles] = useState<SocialHandlesData>(INITIAL_HANDLES)
  const [photos, setPhotos] = useState<string[]>([])

  const [saving, setSaving] = useState(false)
  const [completed, setCompleted] = useState(false)

  // ─── Load existing profile on mount ───────────────────────────────
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/profile')
        const data = await res.json()
        if (cancelled) return
        if (data.profile) {
          const p = data.profile
          if (p.displayName) setBasic((b) => ({ ...b, displayName: p.displayName }))
          if (p.age) setBasic((b) => ({ ...b, age: String(p.age) }))
          if (p.bio) setBasic((b) => ({ ...b, bio: p.bio }))
          if (p.districtId) setDistrictId(p.districtId)
          if (p.streetTag) setStreetTag(p.streetTag)
          if (p.tribeTags) {
            try {
              const parsed = JSON.parse(p.tribeTags)
              if (Array.isArray(parsed)) setTribeTags(parsed)
            } catch { /* ignore */ }
          }
          if (p.telegram || p.instagram || p.signal || p.otherSocial) {
            setHandles({
              telegram: p.telegram || '',
              instagram: p.instagram || '',
              signal: p.signal || '',
              other: p.otherSocial || '',
            })
          }
          if (p.photoUrls) {
            try {
              const parsed = JSON.parse(p.photoUrls)
              if (Array.isArray(parsed)) setPhotos(parsed)
            } catch { /* ignore */ }
          }
        }
      } catch {
        // No profile yet — start fresh
      }
    })()
    return () => { cancelled = true }
  }, [])

  // ─── Save to API ──────────────────────────────────────────────────
  const saveProfile = useCallback(async (partialData: Record<string, unknown>) => {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialData),
      })
      if (!res.ok) {
        const data = await res.json()
        toast({
          title: 'Save failed',
          description: data.error || 'Please try again.',
          variant: 'destructive',
        })
        return false
      }
      return true
    } catch {
      toast({
        title: 'Network error',
        description: 'Could not save. Check your connection.',
        variant: 'destructive',
      })
      return false
    } finally {
      setSaving(false)
    }
  }, [toast])

  // ─── Step navigation ──────────────────────────────────────────────
  const goNext = useCallback(async () => {
    // Save current step's data
    let saveData: Record<string, unknown> = {}
    switch (currentStep) {
      case 'basic': {
        const name = basic.displayName.trim()
        const ageNum = basic.age ? Number(basic.age) : null
        saveData = { displayName: name, age: ageNum, bio: basic.bio || null }
        // Validate required
        if (!name) {
          toast({ title: 'Name needed', description: 'Your name is required.', variant: 'destructive' })
          return
        }
        if (name.length < 2) {
          toast({ title: 'Name too short', description: 'At least 2 characters.', variant: 'destructive' })
          return
        }
        if (/\s/.test(name)) {
          toast({ title: 'One word only', description: 'No spaces in your name — one word that represents you.', variant: 'destructive' })
          return
        }
        // Check availability before proceeding
        try {
          const checkRes = await fetch(`/api/profile/check-username?q=${encodeURIComponent(name)}`)
          const checkData = await checkRes.json()
          if (!checkData.available) {
            toast({ title: 'Name taken', description: checkData.suggestion ? `Try "${checkData.suggestion}" instead.` : 'This name is already taken. Pick another.', variant: 'destructive' })
            return
          }
        } catch {
          // Network error — allow proceed (will be caught on save)
        }
        if (basic.age && (Number(basic.age) < 18 || Number(basic.age) > 100)) {
          toast({ title: 'Age check', description: 'Must be 18–100.', variant: 'destructive' })
          return
        }
        break
      }
      case 'district':
        saveData = { districtId: districtId || null, streetTag: streetTag || null }
        break
      case 'tags':
        saveData = { tribeTags }
        break
      case 'handles':
        saveData = {
          telegram: handles.telegram || null,
          instagram: handles.instagram || null,
          signal: handles.signal || null,
          otherSocial: handles.other || null,
        }
        break
      case 'photos':
        saveData = { photoUrls: photos }
        break
    }

    const ok = await saveProfile(saveData)
    if (!ok) return

    if (stepIndex < STEPS.length - 1) {
      setStepIndex((i) => i + 1)
    } else {
      // Final step complete — mark done
      setCompleted(true)
    }
  }, [currentStep, basic, districtId, streetTag, tribeTags, handles, photos, stepIndex, saveProfile, toast])

  const goBack = useCallback(() => {
    if (stepIndex > 0) setStepIndex((i) => i - 1)
  }, [stepIndex])

  // ─── Completion screen ────────────────────────────────────────────
  if (completed) {
    return (
      <main className="min-h-screen bg-hero-dark flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          <div className="relative mx-auto mb-8 h-24 w-24">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="absolute inset-0 rounded-full bg-sage/20 flex items-center justify-center"
            >
              <PartyPopper className="h-12 w-12 text-sage-light" />
            </motion.div>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.5, delay: 0.3, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-sage-light"
            />
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-black text-cream mb-3">
            You&apos;re all set, gal.
          </h1>
          <p className="font-body text-cream/65 mb-8">
            Your profile is live. Other galz can find you now. Go see who&apos;s out there.
          </p>

          <Button
            onClick={() => router.push('/')}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-warm-rose px-8 font-display text-base font-semibold text-white shadow-lg shadow-warm-rose-deep/40 transition-all hover:bg-warm-rose-dark hover:scale-[1.03] active:scale-100"
          >
            <ShieldCheck className="h-4 w-4 text-gold-light" />
            Let&apos;s go
          </Button>

          <p className="mt-6 font-body text-xs text-cream/40">
            You can always edit your profile later.
          </p>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-hero-dark px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo size="sm" variant="dark" />
        </div>

        {/* Setup progress */}
        <SetupProgress
          currentStep={stepIndex}
          totalSteps={STEPS.length}
          stepLabels={STEP_LABELS}
        />

        {/* Step content */}
        <div className="glass-dark rounded-3xl border border-cream/10 p-5 sm:p-7 shadow-2xl mb-5">
          <AnimatePresence mode="wait">
            {currentStep === 'basic' && (
              <motion.div key="basic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <BasicInfo data={basic} onChange={setBasic} />
              </motion.div>
            )}

            {currentStep === 'district' && (
              <motion.div key="district" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DistrictSelector value={districtId} onChange={setDistrictId} />
                {/* Street tag (same step as district) */}
                <div className="mt-5">
                  <StreetTag value={streetTag} onChange={setStreetTag} />
                </div>
              </motion.div>
            )}

            {currentStep === 'tags' && (
              <motion.div key="tags" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TribeTagSelector selectedIds={tribeTags} onChange={setTribeTags} />
              </motion.div>
            )}

            {currentStep === 'handles' && (
              <motion.div key="handles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SocialHandles data={handles} onChange={setHandles} />
              </motion.div>
            )}

            {currentStep === 'photos' && (
              <motion.div key="photos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-5"
                >
                  <div className="text-center mb-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-warm-rose-light/30 bg-warm-rose/10 px-3 py-1 mb-3">
                      <span className="font-body text-xs font-medium text-cream tracking-wide">Final step</span>
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-black text-cream leading-tight">
                      Show your face, gal.
                    </h2>
                    <p className="mt-2 font-body text-sm text-cream/65 leading-relaxed">
                      Photos make galz 10× more likely to connect with you. Add at least one.
                    </p>
                  </div>
                  <PhotoUpload photos={photos} onChange={setPhotos} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={goBack}
            disabled={stepIndex === 0 || saving}
            className="inline-flex h-11 items-center gap-1.5 rounded-full border border-cream/15 px-5 font-body text-sm text-cream/70 transition-all hover:bg-cream/5 hover:text-cream disabled:opacity-30"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>

          <Button
            type="button"
            onClick={goNext}
            disabled={saving}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-warm-rose px-6 font-display text-sm font-semibold text-white shadow-lg shadow-warm-rose-deep/40 transition-all hover:bg-warm-rose-dark hover:scale-[1.02] active:scale-100"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : stepIndex === STEPS.length - 1 ? (
              <>
                Finish
                <PartyPopper className="h-4 w-4 text-gold-light" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Skip hint for optional steps */}
        {currentStep !== 'basic' && (
          <p className="mt-4 text-center font-body text-xs text-cream/35">
            This step is optional — you can skip and add it later.
          </p>
        )}
      </div>
    </main>
  )
}
