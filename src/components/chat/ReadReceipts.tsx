'use client'

// ════════════════════════════════════════════════════════════════════
//  Phase 5.5 — Read Receipts
//  ✓ (sent) → ✓✓ (delivered) → ✓✓ blue (read)
// ════════════════════════════════════════════════════════════════════

import { Check, CheckCheck } from 'lucide-react'

interface ReadReceiptsProps {
  readAt: string | Date | null
  deliveredAt: string | Date | null
  isMine: boolean
}

export function ReadReceipts({ readAt, deliveredAt, isMine }: ReadReceiptsProps) {
  if (!isMine) return null

  if (readAt) {
    return <CheckCheck className="h-3.5 w-3.5 text-warm-rose-light" aria-label="Read" />
  }
  if (deliveredAt) {
    return <CheckCheck className="h-3.5 w-3.5 text-cream/40" aria-label="Delivered" />
  }
  return <Check className="h-3.5 w-3.5 text-cream/40" aria-label="Sent" />
}
