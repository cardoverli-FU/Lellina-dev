// ════════════════════════════════════════════════════════════════════
//  Phase 5.8 — Decline Chat Request
//  POST /api/chat/request/[id]/decline → marks request DECLINED
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const request = await db.chatRequest.findUnique({
      where: { id },
      select: { id: true, toId: true, status: true },
    })

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (request.toId !== user.id) {
      return NextResponse.json({ error: 'Not your request to decline' }, { status: 403 })
    }

    if (request.status !== 'PENDING') {
      return NextResponse.json({ error: `Request already ${request.status}` }, { status: 409 })
    }

    await db.chatRequest.update({
      where: { id: request.id },
      data: { status: 'DECLINED', respondedAt: new Date() },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[chat/request/decline] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
