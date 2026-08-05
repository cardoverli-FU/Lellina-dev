// ════════════════════════════════════════════════════════════════════
//  Phase 5.8/5.9 — Chat Limits
//  GET /api/chat/limits → { remaining, hasLellyPass, sentToday }
// ════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { hasLellyPass } from '@/lib/gating'
import {
  getRemainingChatRequests,
  getChatRequestsSentToday,
  FREE_DAILY_CHAT_REQUESTS,
} from '@/lib/chat-limits'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [remaining, hasPass, sentToday] = await Promise.all([
      getRemainingChatRequests(user.id),
      hasLellyPass(user.id),
      getChatRequestsSentToday(user.id),
    ])

    return NextResponse.json({
      remaining, // -1 = unlimited (Lelly)
      hasLellyPass: hasPass,
      sentToday,
      dailyLimit: FREE_DAILY_CHAT_REQUESTS,
      isUnlimited: remaining === -1,
    })
  } catch (err) {
    console.error('[chat/limits] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
