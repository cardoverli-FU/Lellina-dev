// ════════════════════════════════════════════════════════════════════
//  Lellina — Device Fingerprint (Phase 2.7)
//  Client-side fingerprint computed from browser signals.
//  Sent to server as a hash — server never sees raw fingerprint data.
// ════════════════════════════════════════════════════════════════════

/**
 * Compute a device fingerprint hash from browser signals.
 * Called on the CLIENT side, result sent to server.
 *
 * Signals collected (privacy-respecting — no PII):
 * - User agent
 * - Screen resolution + color depth
 * - Timezone
 * - Language
 * - Platform
 * - Hardware concurrency (CPU cores)
 * - Device memory (if available)
 * - Canvas fingerprint (subtle rendering differences per device)
 *
 * Returns a SHA-256 hex hash. The raw signals are NEVER sent to the server.
 */
export async function computeDeviceFingerprint(): Promise<string> {
  const signals: string[] = []

  // Basic signals
  signals.push(navigator.userAgent)
  signals.push(navigator.language)
  signals.push(navigator.languages?.join(',') || '')
  signals.push(navigator.platform || '')
  signals.push(String(navigator.hardwareConcurrency || 0))
  signals.push(String((navigator as any).deviceMemory || 0))
  signals.push(String(screen.width) + 'x' + String(screen.height))
  signals.push(String(screen.colorDepth))
  signals.push(String(screen.pixelDepth))
  signals.push(Intl.DateTimeFormat().resolvedOptions().timeZone || '')

  // Canvas fingerprint (subtle per-device rendering differences)
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 50
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillStyle = '#f60'
      ctx.fillRect(125, 1, 62, 20)
      ctx.fillStyle = '#069'
      ctx.fillText('Lellina 🌹', 2, 15)
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
      ctx.fillText('Lellina 🌹', 4, 17)
      signals.push(canvas.toDataURL())
    }
  } catch {
    // Canvas might be blocked — skip
  }

  // WebRTC IP (optional, best-effort)
  try {
    const rtc = (await getLocalIP()) || ''
    signals.push(rtc)
  } catch {
    // skip
  }

  // SHA-256 hash all signals together
  const combined = signals.join('|||')
  const hash = await sha256(combined)
  return hash
}

/**
 * Get local IP via WebRTC (best-effort, may be blocked).
 */
function getLocalIP(): Promise<string> {
  return new Promise((resolve) => {
    const rtc = new RTCPeerConnection({ iceServers: [] })
    rtc.createDataChannel('')
    rtc.onicecandidate = (e) => {
      if (e.candidate) {
        const ip = e.candidate.candidate.split(' ')[4]
        if (ip && ip !== '0.0.0.0') {
          resolve(ip)
          rtc.close()
        }
      }
    }
    rtc.createOffer()
      .then((offer) => rtc.setLocalDescription(offer))
      .catch(() => resolve(''))
    setTimeout(() => { rtc.close(); resolve('') }, 2000)
  })
}

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
