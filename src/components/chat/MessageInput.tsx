'use client'

// ════════════════════════════════════════════════════════════════════
//  Phase 5.2 — Typing Indicator + Message Input
// ════════════════════════════════════════════════════════════════════

import { motion, AnimatePresence } from 'framer-motion'
import { Send, ImagePlus, X } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'

// ─── Typing dots ───
export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      className="flex justify-start"
    >
      <div className="rounded-2xl rounded-bl-md bg-cream/10 px-4 py-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-cream/60"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Message input ───
interface MessageInputProps {
  onSend: (content: string, photoUrl?: string) => void
  onTyping: (isTyping: boolean) => void
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({
  onSend,
  onTyping,
  disabled,
  placeholder = 'Type a message…',
}: MessageInputProps) {
  const [text, setText] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  // Typing indicator: fire onTyping(true) on first keystroke, (false) after 2s silence
  useEffect(() => {
    if (text && !isTypingRef.current) {
      isTypingRef.current = true
      onTyping(true)
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false
        onTyping(false)
      }
    }, 2000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed && !photo) return
    onSend(trimmed || '', photo || undefined)
    setText('')
    setPhoto(null)
    setPhotoPreview(null)
    if (isTypingRef.current) {
      isTypingRef.current = false
      onTyping(false)
    }
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 4 * 1024 * 1024) {
      alert('Photo too large (max 4MB)')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setPhoto(result)
      setPhotoPreview(result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="border-t border-cream/10 bg-hero-dark/95 backdrop-blur-md p-3">
      {/* Photo preview */}
      <AnimatePresence>
        {photoPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 flex items-center gap-2"
          >
            <div className="relative">
              <img
                src={photoPreview}
                alt="Preview"
                className="h-16 w-16 rounded-lg object-cover"
              />
              <button
                onClick={() => {
                  setPhoto(null)
                  setPhotoPreview(null)
                }}
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-warm-rose"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
            <span className="font-body text-[11px] text-cream/50">Photo ready</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2">
        {/* Photo button */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-cream/5 text-cream/60 transition-all hover:bg-cream/10 hover:text-cream disabled:opacity-50"
          aria-label="Send photo"
        >
          <ImagePlus className="h-5 w-5" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoSelect}
          className="hidden"
        />

        {/* Text input */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className="flex-1 resize-none rounded-2xl border border-cream/10 bg-cream/5 px-4 py-2.5 font-body text-sm text-cream placeholder:text-cream/30 focus:border-warm-rose/30 focus:outline-none focus:ring-1 focus:ring-warm-rose/20 disabled:opacity-50 max-h-32"
          style={{ minHeight: '42px' }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !photo)}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-warm-rose text-white transition-all hover:bg-warm-rose-dark hover:scale-[1.05] active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
