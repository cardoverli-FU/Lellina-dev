'use client'

// ════════════════════════════════════════════════════════════════════
//  Phase 5.1 — Socket.io Client + React Hooks
//
//  Connection: io("/?XTransformPort=3003") — gateway routes to chat-service.
//  Auth: fetches a short-lived JWT from /api/chat/token, passes in handshake.
//
//  Hooks:
//    useSocket()         → singleton socket instance (or null)
//    useOnlineUsers()    → Set<userId> of currently-online users
// ════════════════════════════════════════════════════════════════════

import { io, Socket } from 'socket.io-client'
import { useEffect, useState, useRef, useCallback } from 'react'

let socketPromise: Promise<Socket | null> | null = null

/** Fetch a chat token and connect to the socket service. Singleton. */
export function getSocket(): Promise<Socket | null> {
  if (socketPromise) return socketPromise

  socketPromise = (async () => {
    try {
      const res = await fetch('/api/chat/token')
      if (!res.ok) return null
      const { token } = await res.json()
      if (!token) return null

      // Match the working example pattern: io('/?XTransformPort=3003').
      // The URI path '/' becomes the socket.io path (server also uses path: '/').
      // Caddy routes via the XTransformPort query param → port 3003.
      const socket = io('/?XTransformPort=3003', {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10,
      })

      // Keep connection lifecycle logs for production debugging
      socket.on('connect_error', (err: Error) => {
        console.error('[socket-client] connect_error:', err.message)
      })

      return socket
    } catch (err) {
      console.error('[socket-client] connection failed:', err)
      return null
    }
  })()

  return socketPromise
}

/** React hook: returns a connected socket, or null while connecting. */
export function useSocket(): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    let active = true
    getSocket().then((s) => {
      if (active) setSocket(s)
    })
    return () => {
      active = false
    }
  }, [])

  return socket
}

/** React hook: tracks a set of online userIds via presence events. */
export function useOnlineUsers(initial: string[] = []): {
  online: Set<string>
  isOnline: (userId: string) => boolean
} {
  const [online, setOnline] = useState<Set<string>>(new Set(initial))
  const socket = useSocket()
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    if (!socket) return

    const onOnline = ({ userId }: { userId: string }) => {
      if (!mountedRef.current) return
      setOnline((prev) => {
        if (prev.has(userId)) return prev
        const next = new Set(prev)
        next.add(userId)
        return next
      })
    }

    const onOffline = ({ userId }: { userId: string; lastSeen?: string }) => {
      if (!mountedRef.current) return
      setOnline((prev) => {
        if (!prev.has(userId)) return prev
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    }

    socket.on('presence:online', onOnline)
    socket.on('presence:offline', onOffline)

    return () => {
      mountedRef.current = false
      socket.off('presence:online', onOnline)
      socket.off('presence:offline', onOffline)
    }
  }, [socket])

  const isOnline = useCallback((userId: string) => online.has(userId), [online])

  return { online, isOnline }
}

/** Disconnect the socket (call on logout). */
export function disconnectSocket() {
  if (socketPromise) {
    socketPromise.then((s) => {
      if (s) s.disconnect()
    })
    socketPromise = null
  }
}
