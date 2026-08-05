'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { User, Sparkles, Loader2, Check, X, Lightbulb } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export interface BasicInfoData {
  displayName: string
  age: string
  bio: string
}

interface BasicInfoProps {
  data: BasicInfoData
  onChange: (data: BasicInfoData) => void
}

type NameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

/**
 * Phase 3.3 — Display name, age, bio fields.
 * Name must be a single word, unique, and community-relevant.
 */
export function BasicInfo({ data, onChange }: BasicInfoProps) {
  const [focused, setFocused] = useState<string | null>(null)
  const [nameStatus, setNameStatus] = useState<NameStatus>('idle')
  const [nameMessage, setNameMessage] = useState('')
  const [nameSuggestion, setNameSuggestion] = useState('')
  const checkTimeout = useRef<ReturnType<typeof setTimeout>>()

  // ─── Debounced username availability check ─────────────────────────
  const checkName = useCallback(async (name: string) => {
    const trimmed = name.trim().toLowerCase()

    // Client-side checks first
    if (!trimmed) {
      setNameStatus('idle')
      setNameMessage('')
      setNameSuggestion('')
      return
    }
    if (trimmed.length < 2) {
      setNameStatus('invalid')
      setNameMessage('At least 2 characters')
      setNameSuggestion('')
      return
    }
    if (/\s/.test(trimmed)) {
      setNameStatus('invalid')
      setNameMessage('One word only — no spaces')
      setNameSuggestion('')
      return
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setNameStatus('invalid')
      setNameMessage('Only letters, numbers, _ and -')
      setNameSuggestion('')
      return
    }

    // Check with server
    setNameStatus('checking')
    setNameMessage('')
    setNameSuggestion('')

    try {
      const res = await fetch(`/api/profile/check-username?q=${encodeURIComponent(trimmed)}`)
      const result = await res.json()

      if (result.available) {
        setNameStatus('available')
        setNameMessage(result.own ? 'That\'s your name ✓' : 'This name is all yours!')
        setNameSuggestion('')
      } else {
        setNameStatus('taken')
        setNameMessage(result.reason || 'Already taken')
        setNameSuggestion(result.suggestion || '')
      }
    } catch {
      setNameStatus('idle')
      setNameMessage('')
    }
  }, [])

  // Debounce the check — 400ms after user stops typing
  useEffect(() => {
    const trimmed = data.displayName.trim()

    if (checkTimeout.current) clearTimeout(checkTimeout.current)

    if (!trimmed) {
      // Schedule reset to idle (avoids direct setState in effect)
      checkTimeout.current = setTimeout(() => {
        setNameStatus('idle')
        setNameMessage('')
        setNameSuggestion('')
      }, 0)
      return
    }

    checkTimeout.current = setTimeout(() => checkName(trimmed), 400)

    return () => {
      if (checkTimeout.current) clearTimeout(checkTimeout.current)
    }
  }, [data.displayName, checkName])

  const handleChange = (field: keyof BasicInfoData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange({ ...data, [field]: e.target.value })
  }

  const applySuggestion = () => {
    if (nameSuggestion) {
      onChange({ ...data, displayName: nameSuggestion })
    }
  }

  // Name status icon
  const nameIcon = (() => {
    switch (nameStatus) {
      case 'checking':
        return <Loader2 className="h-4 w-4 text-cream/40 animate-spin" />
      case 'available':
        return <Check className="h-4 w-4 text-sage-light" />
      case 'taken':
      case 'invalid':
        return <X className="h-4 w-4 text-warm-rose-light" />
      default:
        return <User className="h-4 w-4 text-cream/35 pointer-events-none" />
    }
  })()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Step header */}
      <div className="text-center mb-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-warm-rose-light/30 bg-warm-rose/10 px-3 py-1 mb-3">
          <Sparkles className="h-3 w-3 text-warm-rose-light" />
          <span className="font-body text-xs font-medium text-cream tracking-wide">Step 1 of 5</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-black text-cream leading-tight">
          Pick your name, gal.
        </h2>
        <p className="mt-2 font-body text-sm text-cream/65 leading-relaxed">
          One word that represents you. Something that speaks to your identity or vibe.
        </p>
      </div>

      {/* Display name */}
      <div className="space-y-2">
        <Label htmlFor="displayName" className="text-cream/80 font-body text-xs uppercase tracking-wider">
          Your name
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-3">
            {nameIcon}
          </div>
          <Input
            id="displayName"
            type="text"
            value={data.displayName}
            onChange={handleChange('displayName')}
            onFocus={() => setFocused('displayName')}
            onBlur={() => setFocused(null)}
            placeholder="e.g. Nia, Zuri, StudVibes"
            maxLength={30}
            className={`h-11 pl-10 bg-cream/5 border-cream/15 text-cream placeholder:text-cream/35 focus-visible:border-warm-rose-light focus-visible:ring-warm-rose-light/30 ${
              nameStatus === 'available' ? 'border-sage-light/50' : ''
            } ${nameStatus === 'taken' || nameStatus === 'invalid' ? 'border-warm-rose-light/50' : ''}`}
          />
        </div>
        {/* Status message */}
        {nameMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5"
          >
            <p className={`font-body text-[11px] ${
              nameStatus === 'available' ? 'text-sage-light' : 'text-warm-rose-light'
            }`}>
              {nameMessage}
            </p>
            {nameSuggestion && (
              <button
                type="button"
                onClick={applySuggestion}
                className="font-body text-[11px] text-gold-light underline underline-offset-2 hover:text-gold-light/80"
              >
                Try {nameSuggestion}
              </button>
            )}
          </motion.div>
        )}
        {/* Name tips */}
        <div className="flex items-start gap-1.5 rounded-lg bg-cream/[0.03] border border-cream/8 px-3 py-2">
          <Lightbulb className="h-3 w-3 text-gold-light flex-shrink-0 mt-0.5" />
          <p className="font-body text-[10px] text-cream/45 leading-relaxed">
            One word, no spaces. Pick something that represents your identity — like a name, a vibe, or a term from the community. Think: Nia, Zuri, StudVibes, FemmeFatale.
          </p>
        </div>
        <p className="font-body text-[11px] text-cream/40 pl-0.5">
          {data.displayName.length}/30 — one word that&apos;s yours.
        </p>
      </div>

      {/* Age */}
      <div className="space-y-2">
        <Label htmlFor="age" className="text-cream/80 font-body text-xs uppercase tracking-wider">
          Age
        </Label>
        <Input
          id="age"
          type="number"
          min={18}
          max={100}
          value={data.age}
          onChange={handleChange('age')}
          onFocus={() => setFocused('age')}
          onBlur={() => setFocused(null)}
          placeholder="18–100"
          className="h-11 bg-cream/5 border-cream/15 text-cream placeholder:text-cream/35 focus-visible:border-warm-rose-light focus-visible:ring-warm-rose-light/30"
        />
        <p className="font-body text-[11px] text-cream/40 pl-0.5">
          Only the number. Your year stays yours.
        </p>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-cream/80 font-body text-xs uppercase tracking-wider">
          Bio
        </Label>
        <Textarea
          id="bio"
          value={data.bio}
          onChange={handleChange('bio')}
          onFocus={() => setFocused('bio')}
          onBlur={() => setFocused(null)}
          placeholder="What do you want other galz to know about you? Keep it real."
          maxLength={500}
          rows={4}
          className="bg-cream/5 border-cream/15 text-cream placeholder:text-cream/35 focus-visible:border-warm-rose-light focus-visible:ring-warm-rose-light/30 resize-none"
        />
        <p className="font-body text-[11px] text-cream/40 pl-0.5">
          {data.bio.length}/500 — your words, your world.
        </p>
      </div>

      {/* Focused field glow indicator */}
      {focused && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-body text-xs text-warm-rose-light/70 text-center italic"
        >
          {focused === 'displayName' && 'One word that represents you. Unique, no spaces.'}
          {focused === 'age' && 'You must be 18 or older. We only store the number.'}
          {focused === 'bio' && 'Let your personality shine. This is what galz read first.'}
        </motion.p>
      )}
    </motion.div>
  )
}
