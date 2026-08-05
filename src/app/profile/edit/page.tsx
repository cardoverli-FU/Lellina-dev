'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { PhotoUpload } from '@/components/profile/PhotoUpload'
import { DistrictSelector } from '@/components/profile/DistrictSelector'
import { TribeTagSelector } from '@/components/profile/TribeTagSelector'

interface ProfileData {
  displayName: string | null
  age: number | null
  bio: string | null
  photoUrls: string
  districtId: string | null
  streetTag: string | null
  tribeTags: string
  telegram: string | null
  instagram: string | null
  signal: string | null
}

/**
 * Phase 3.11 — Profile edit page.
 * Pre-populated from current profile. Save all fields at once.
 */
export default function ProfileEditPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [age, setAge] = useState('')
  const [bio, setBio] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [districtId, setDistrictId] = useState('')
  const [streetTag, setStreetTag] = useState('')
  const [tribeTags, setTribeTags] = useState<string[]>([])
  const [telegram, setTelegram] = useState('')
  const [instagram, setInstagram] = useState('')
  const [signal, setSignal] = useState('')

  // Load existing profile
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/profile')
        const data = await res.json()
        if (cancelled) return
        if (data.profile) {
          const p = data.profile as ProfileData
          setDisplayName(p.displayName || '')
          setAge(p.age ? String(p.age) : '')
          setBio(p.bio || '')
          setDistrictId(p.districtId || '')
          setStreetTag(p.streetTag || '')
          setTelegram(p.telegram || '')
          setInstagram(p.instagram || '')
          setSignal(p.signal || '')
          try { const arr = JSON.parse(p.tribeTags); if (Array.isArray(arr)) setTribeTags(arr) } catch { /* */ }
          try { const arr = JSON.parse(p.photoUrls); if (Array.isArray(arr)) setPhotos(arr) } catch { /* */ }
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName.trim() || null,
          age: age ? Number(age) : null,
          bio: bio.trim() || null,
          photoUrls: photos,
          districtId: districtId || null,
          streetTag: streetTag.trim() || null,
          tribeTags,
          telegram: telegram.trim() || null,
          instagram: instagram.trim() || null,
          signal: signal.trim() || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast({ title: 'Save failed', description: data.error || 'Try again.', variant: 'destructive' })
        return
      }

      toast({ title: 'Profile saved', description: 'Looking good, gal.' })
      router.back()
    } catch {
      toast({ title: 'Network error', description: 'Could not save.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-hero-dark flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-warm-rose-light animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-hero-dark px-4 py-8">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-cream/70 hover:text-cream transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-body text-sm">Back</span>
          </button>
          <Logo size="sm" variant="dark" />
          <Button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-warm-rose px-4 font-body text-xs font-semibold text-white shadow-md"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </Button>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="font-display text-2xl font-black text-cream mb-5">Edit your profile</h1>

          <div className="glass-dark rounded-3xl border border-cream/10 p-5 sm:p-6 space-y-5">
            {/* Photos */}
            <div>
              <Label className="text-cream/80 font-body text-xs uppercase tracking-wider mb-2 block">Photos</Label>
              <PhotoUpload photos={photos} onChange={setPhotos} />
            </div>

            {/* Display name */}
            <div className="space-y-2">
              <Label htmlFor="edit-displayName" className="text-cream/80 font-body text-xs uppercase tracking-wider">Display name</Label>
              <Input id="edit-displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={50} className="h-11 bg-cream/5 border-cream/15 text-cream placeholder:text-cream/35 focus-visible:border-warm-rose-light" />
            </div>

            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="edit-age" className="text-cream/80 font-body text-xs uppercase tracking-wider">Age</Label>
              <Input id="edit-age" type="number" min={18} max={100} value={age} onChange={(e) => setAge(e.target.value)} className="h-11 bg-cream/5 border-cream/15 text-cream placeholder:text-cream/35 focus-visible:border-warm-rose-light" />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="edit-bio" className="text-cream/80 font-body text-xs uppercase tracking-wider">Bio</Label>
              <Textarea id="edit-bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} rows={4} className="bg-cream/5 border-cream/15 text-cream placeholder:text-cream/35 focus-visible:border-warm-rose-light resize-none" />
            </div>

            {/* District */}
            <div>
              <Label className="text-cream/80 font-body text-xs uppercase tracking-wider mb-2 block">District</Label>
              <DistrictSelector value={districtId} onChange={setDistrictId} />
            </div>

            {/* Street tag */}
            <div className="space-y-2">
              <Label htmlFor="edit-street" className="text-cream/80 font-body text-xs uppercase tracking-wider">Neighbourhood</Label>
              <Input id="edit-street" value={streetTag} onChange={(e) => setStreetTag(e.target.value)} maxLength={60} placeholder="e.g. Sinza, Sea Point" className="h-11 bg-cream/5 border-cream/15 text-cream placeholder:text-cream/35 focus-visible:border-warm-rose-light" />
            </div>

            {/* Tribe tags */}
            <div>
              <Label className="text-cream/80 font-body text-xs uppercase tracking-wider mb-2 block">Tribe tags</Label>
              <TribeTagSelector selectedIds={tribeTags} onChange={setTribeTags} />
            </div>

            {/* Social handles */}
            <div className="space-y-3">
              <Label className="text-cream/80 font-body text-xs uppercase tracking-wider">Social handles</Label>
              <Input value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="Telegram @handle" maxLength={100} className="h-11 bg-cream/5 border-cream/15 text-cream placeholder:text-cream/35 focus-visible:border-warm-rose-light" />
              <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram @handle" maxLength={100} className="h-11 bg-cream/5 border-cream/15 text-cream placeholder:text-cream/35 focus-visible:border-warm-rose-light" />
              <Input value={signal} onChange={(e) => setSignal(e.target.value)} placeholder="Signal number/username" maxLength={100} className="h-11 bg-cream/5 border-cream/15 text-cream placeholder:text-cream/35 focus-visible:border-warm-rose-light" />
              <p className="font-body text-[11px] text-cream/40">Hidden until mutual connection.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
