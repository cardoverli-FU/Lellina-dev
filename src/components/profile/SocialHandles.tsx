'use client'

import { motion } from 'framer-motion'
import { Send, Lock, MessageCircle, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface SocialHandlesData {
  telegram: string
  instagram: string
  signal: string
  other: string
}

interface SocialHandlesProps {
  data: SocialHandlesData
  onChange: (data: SocialHandlesData) => void
}

/**
 * Phase 3.7 — Social handles.
 * Add ANY social media you want. All hidden until mutual approval.
 * In-app chat is available — handles are optional.
 */
export function SocialHandles({ data, onChange }: SocialHandlesProps) {
  const handleChange = (field: keyof SocialHandlesData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({ ...data, [field]: e.target.value })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Step header */}
      <div className="text-center mb-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-sage-light/30 bg-sage/10 px-3 py-1 mb-3">
          <Send className="h-3 w-3 text-sage-light" />
          <span className="font-body text-xs font-medium text-cream tracking-wide">Step 4 of 5</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-black text-cream leading-tight">
          Your handles. If you want.
        </h2>
        <p className="mt-2 font-body text-sm text-cream/65 leading-relaxed">
          Add them now, but they stay hidden until you both approve each other. Or just use in-app chat — it&apos;s good.
        </p>
      </div>

      {/* In-app chat notice */}
      <div className="flex items-start gap-2 rounded-xl border border-warm-rose-light/20 bg-warm-rose/5 p-3">
        <MessageCircle className="h-4 w-4 text-warm-rose-light flex-shrink-0 mt-0.5" />
        <p className="font-body text-xs text-cream/60 leading-relaxed">
          <span className="text-warm-rose-light font-semibold">In-app chat works great.</span> You don&apos;t need to share any handles. But if you want to connect on Telegram, IG, Signal, or anything else — add them here. They&apos;re hidden until mutual approval.
        </p>
      </div>

      {/* Privacy notice */}
      <div className="flex items-start gap-2 rounded-xl border border-sage-light/20 bg-sage/5 p-3">
        <Lock className="h-4 w-4 text-sage-light flex-shrink-0 mt-0.5" />
        <p className="font-body text-xs text-cream/60 leading-relaxed">
          Handles are <span className="text-sage-light font-semibold">never public</span>. They only unlock after a mutual connection — both of you approve. Until then, nobody sees these.
        </p>
      </div>

      {/* Telegram */}
      <div className="space-y-2">
        <Label htmlFor="telegram" className="text-cream/80 font-body text-xs uppercase tracking-wider">
          Telegram
        </Label>
        <Input
          id="telegram"
          type="text"
          value={data.telegram}
          onChange={handleChange('telegram')}
          placeholder="@yourhandle"
          maxLength={100}
          autoCapitalize="none"
          autoCorrect="off"
          className="h-11 bg-cream/5 border-cream/15 text-cream placeholder:text-cream/35 focus-visible:border-warm-rose-light focus-visible:ring-warm-rose-light/30"
        />
      </div>

      {/* Instagram */}
      <div className="space-y-2">
        <Label htmlFor="instagram" className="text-cream/80 font-body text-xs uppercase tracking-wider">
          Instagram
        </Label>
        <Input
          id="instagram"
          type="text"
          value={data.instagram}
          onChange={handleChange('instagram')}
          placeholder="@yourhandle"
          maxLength={100}
          autoCapitalize="none"
          autoCorrect="off"
          className="h-11 bg-cream/5 border-cream/15 text-cream placeholder:text-cream/35 focus-visible:border-warm-rose-light focus-visible:ring-warm-rose-light/30"
        />
      </div>

      {/* Signal */}
      <div className="space-y-2">
        <Label htmlFor="signal" className="text-cream/80 font-body text-xs uppercase tracking-wider">
          Signal
        </Label>
        <Input
          id="signal"
          type="text"
          value={data.signal}
          onChange={handleChange('signal')}
          placeholder="Your Signal number or username"
          maxLength={100}
          className="h-11 bg-cream/5 border-cream/15 text-cream placeholder:text-cream/35 focus-visible:border-warm-rose-light focus-visible:ring-warm-rose-light/30"
        />
      </div>

      {/* Other — any social media */}
      <div className="space-y-2">
        <Label htmlFor="other" className="text-cream/80 font-body text-xs uppercase tracking-wider flex items-center gap-1.5">
          <Plus className="h-3 w-3 text-gold-light" />
          Any other social media
        </Label>
        <Input
          id="other"
          type="text"
          value={data.other}
          onChange={handleChange('other')}
          placeholder="TikTok, Twitter/X, WhatsApp, Snapchat, etc."
          maxLength={200}
          autoCapitalize="none"
          autoCorrect="off"
          className="h-11 bg-cream/5 border-cream/15 text-cream placeholder:text-cream/35 focus-visible:border-warm-rose-light focus-visible:ring-warm-rose-light/30"
        />
        <p className="font-body text-[10px] text-cream/40 pl-0.5">
          Add whatever you want — TikTok, X, WhatsApp, Facebook, anything. We don&apos;t judge.
        </p>
      </div>

      <p className="font-body text-xs text-cream/40 text-center">
        All optional. Add one, some, or none. You can always add them later.
      </p>
    </motion.div>
  )
}
