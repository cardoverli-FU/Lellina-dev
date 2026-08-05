'use client'

// ════════════════════════════════════════════════════════════════════
//  Phase 5.2 — Message Bubble
//  Renders TEXT, PHOTO, SYSTEM, NOT_FEELING_IT, NUDGE message types.
//  Handles blurred photos for free users (photo gating).
// ════════════════════════════════════════════════════════════════════

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { ReadReceipts } from './ReadReceipts'
import { BlurredPhoto } from './BlurredPhoto'
import { PhotoViewer } from './PhotoViewer'

export interface ChatMessage {
  id: string
  senderId: string
  content: string | null
  photoUrl: string | null
  photoWidth?: number | null
  photoHeight?: number | null
  type: string
  deliveredAt: string | Date | null
  readAt: string | Date | null
  deletedAt: string | Date | null
  deletedById?: string | null
  createdAt: string | Date
}

interface MessageBubbleProps {
  message: ChatMessage
  isMine: boolean
  hasLellyPass: boolean
  onPhotoClick?: (url: string) => void
  onDeleteMessage?: (id: string) => void
  showAvatar?: boolean
}

export function MessageBubble({
  message,
  isMine,
  hasLellyPass,
  onPhotoClick,
  onDeleteMessage,
  showAvatar = false,
}: MessageBubbleProps) {
  // ─── System messages ───
  if (message.type === 'SYSTEM') {
    return (
      <div className="flex justify-center py-2">
        <span className="rounded-full bg-cream/5 px-3 py-1 font-body text-[10px] text-cream/40">
          {message.content}
        </span>
      </div>
    )
  }

  // ─── Not Feeling It ───
  if (message.type === 'NOT_FEELING_IT') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
      >
        <div className="max-w-[75%] rounded-2xl border border-gold/20 bg-gold/5 p-3">
          <div className="mb-1 flex items-center gap-1.5">
            <Heart className="h-3 w-3 text-gold-light" />
            <span className="font-body text-[10px] font-semibold text-gold-light">
              Kind exit
            </span>
          </div>
          <p className="font-body text-sm text-cream">{message.content}</p>
        </div>
      </motion.div>
    )
  }

  // ─── Nudge ───
  if (message.type === 'NUDGE') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center py-2"
      >
        <span className="rounded-full bg-gold/15 px-4 py-2 font-body text-xs text-gold-light">
          {message.content}
        </span>
      </motion.div>
    )
  }

  // ─── Deleted message ───
  if (message.deletedAt) {
    return (
      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
        <span className="rounded-2xl bg-cream/5 px-3 py-2 font-body text-xs italic text-cream/30">
          {message.type === 'PHOTO' ? '📷 Photo deleted' : 'Message deleted'}
        </span>
      </div>
    )
  }

  // ─── Photo message ───
  if (message.type === 'PHOTO' && message.photoUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
      >
        <div className="max-w-[75%] space-y-1">
          {/* If I sent it OR I have Lelly → unblurred. Otherwise → blurred. */}
          {isMine || hasLellyPass ? (
            <PhotoViewer
              photoUrl={message.photoUrl}
              isMine={isMine}
              onOpenFull={() => onPhotoClick?.(message.photoUrl!)}
              onDelete={
                isMine && onDeleteMessage
                  ? () => onDeleteMessage(message.id)
                  : undefined
              }
            />
          ) : (
            <BlurredPhoto photoUrl={message.photoUrl} />
          )}
          <div className={`flex items-center gap-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
            <span className="font-body text-[10px] text-cream/40">
              {new Date(message.createdAt).toLocaleTimeString('en', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <ReadReceipts
              readAt={message.readAt}
              deliveredAt={message.deliveredAt}
              isMine={isMine}
            />
          </div>
        </div>
      </motion.div>
    )
  }

  // ─── Text message ───
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
    >
      <div className="max-w-[75%]">
        <div
          className={`rounded-2xl px-3.5 py-2 ${
            isMine
              ? 'bg-warm-rose text-white rounded-br-md'
              : 'bg-cream/10 text-cream rounded-bl-md'
          }`}
        >
          <p className="font-body text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
          <span className="font-body text-[10px] text-cream/40">
            {new Date(message.createdAt).toLocaleTimeString('en', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <ReadReceipts
            readAt={message.readAt}
            deliveredAt={message.deliveredAt}
            isMine={isMine}
          />
        </div>
      </div>
    </motion.div>
  )
}
