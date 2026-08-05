'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Tag, Clock, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ProfileData {
  id: string
  displayName: string | null
  age: number | null
  bio: string | null
  photoUrls: string
  districtId: string | null
  district: { name: string; region: string; country: string } | null
  streetTag: string | null
  tribeTags: string
  isOnline: boolean
  lastActiveAt: string | null
  isFounder: boolean
  createdAt: string
}

/**
 * Phase 3.10 — Profile view page.
 * Public profile shown when viewing another user's profile.
 * Social handles are NOT shown (hidden until mutual — Phase 5).
 */
export default function ProfileViewPage() {
  const params = useParams()
  const router = useRouter()
  const profileId = params.id as string

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profileId) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/profile/${profileId}`)
        if (!res.ok) throw new Error('Not found')
        const data = await res.json()
        if (!cancelled) setProfile(data.profile)
      } catch {
        if (!cancelled) setProfile(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [profileId])

  if (loading) {
    return (
      <main className="min-h-screen bg-hero-dark flex items-center justify-center">
        <div className="animate-pulse text-cream/40 font-body text-sm">Loading profile…</div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-hero-dark flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="font-display text-2xl font-black text-cream mb-3">Profile not found</h2>
          <p className="font-body text-sm text-cream/60 mb-6">This profile doesn&apos;t exist or was removed.</p>
          <Button onClick={() => router.push('/')} variant="ghost" className="text-cream/70">
            <ArrowLeft className="h-4 w-4 mr-2" /> Go back
          </Button>
        </div>
      </main>
    )
  }

  let photoArr: string[] = []
  try { photoArr = JSON.parse(profile.photoUrls) } catch { /* empty */ }
  let tagArr: string[] = []
  try { tagArr = JSON.parse(profile.tribeTags) } catch { /* empty */ }

  const mainPhoto = photoArr[0]

  return (
    <main className="min-h-screen bg-hero-dark">
      {/* Back button */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-soft-charcoal/80 backdrop-blur-md border-b border-cream/10">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-cream/70 hover:text-cream transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-body text-sm">Back</span>
          </button>
          <Logo size="sm" variant="dark" />
          <div className="w-16" /> {/* spacer */}
        </div>
      </div>

      <div className="pt-16 px-4 py-6 mx-auto max-w-lg">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Photo */}
          {mainPhoto ? (
            <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden border border-cream/10 mb-5">
              <img src={mainPhoto} alt={profile.displayName || 'Profile photo'} className="w-full h-full object-cover" />
              {profile.isFounder && (
                <Badge className="absolute top-3 right-3 bg-gold-light/20 border-gold-light/30 text-gold-light font-body text-[10px]">
                  <ShieldCheck className="h-3 w-3 mr-1" /> Founder
                </Badge>
              )}
            </div>
          ) : (
            <div className="w-full aspect-[3/4] rounded-3xl bg-cream/5 border border-cream/10 flex items-center justify-center mb-5">
              <span className="font-body text-cream/25 text-lg">No photo yet</span>
            </div>
          )}

          {/* Name + age */}
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-2xl sm:text-3xl font-black text-cream">
              {profile.displayName || 'Anonymous'}
            </h1>
            {profile.age && (
              <span className="font-body text-sm text-cream/50">{profile.age}</span>
            )}
            {profile.isOnline && (
              <span className="h-2.5 w-2.5 rounded-full bg-sage-light animate-pulse" title="Online" />
            )}
          </div>

          {/* Location */}
          {profile.district && (
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin className="h-3.5 w-3.5 text-cream/40" />
              <span className="font-body text-sm text-cream/60">
                {profile.district.name}, {profile.district.region}
                {profile.streetTag && <span className="text-cream/40"> · {profile.streetTag}</span>}
              </span>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="font-body text-sm text-cream/75 leading-relaxed mb-5 whitespace-pre-wrap">
              {profile.bio}
            </p>
          )}

          {/* Tribe tags */}
          {tagArr.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-1.5 mb-2">
                <Tag className="h-3.5 w-3.5 text-cream/40" />
                <span className="font-body text-xs uppercase tracking-wider text-cream/40">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tagArr.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-cream/15 text-cream/65 font-body text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Last active */}
          {profile.lastActiveAt && (
            <div className="flex items-center gap-1.5 text-cream/35">
              <Clock className="h-3 w-3" />
              <span className="font-body text-[11px]">
                Last active {new Date(profile.lastActiveAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  )
}
