'use client'

import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Plus, X, ImagePlus, Loader2 } from 'lucide-react'

interface PhotoUploadProps {
  photos: string[]
  onChange: (photos: string[]) => void
  maxPhotos?: number
}

/**
 * Phase 3.2 — Profile photo upload.
 * Modern, cute, with smooth animations. Max 6 photos.
 * Photos stored as base64 data URLs (will be converted to URLs in production).
 */
export function PhotoUpload({ photos, onChange, maxPhotos = 6 }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [processing, setProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return null

    // Max 5MB per photo
    if (file.size > 5 * 1024 * 1024) return null

    return new Promise<string | null>((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (!result) return resolve(null)

        // Downscale if needed (max 1024px)
        const img = new Image()
        img.onload = () => {
          const maxDim = 1024
          if (img.width <= maxDim && img.height <= maxDim) {
            resolve(result)
            return
          }
          const scale = Math.min(maxDim / img.width, maxDim / img.height)
          const canvas = document.createElement('canvas')
          canvas.width = Math.round(img.width * scale)
          canvas.height = Math.round(img.height * scale)
          const ctx = canvas.getContext('2d')
          if (!ctx) { resolve(null); return }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/jpeg', 0.85))
        }
        img.onerror = () => resolve(null)
        img.src = result
      }
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    })
  }, [])

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    if (processing) return
    setProcessing(true)

    const remaining = maxPhotos - photos.length
    if (remaining <= 0) { setProcessing(false); return }

    const toProcess = Array.from(files).slice(0, remaining)
    const results: string[] = []

    for (const file of toProcess) {
      const dataUrl = await processFile(file)
      if (dataUrl) results.push(dataUrl)
    }

    if (results.length > 0) {
      onChange([...photos, ...results])
    }
    setProcessing(false)
  }, [photos, onChange, maxPhotos, processing, processFile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index))
  }

  const canAddMore = photos.length < maxPhotos

  return (
    <div className="space-y-3">
      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, i) => (
          <motion.div
            key={`photo-${i}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative aspect-square rounded-xl overflow-hidden border border-cream/15 group"
          >
            <img
              src={photo}
              alt={`Photo ${i + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Remove button */}
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-soft-charcoal/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3 text-cream" />
            </button>
            {/* Primary badge */}
            {i === 0 && (
              <span className="absolute bottom-1.5 left-1.5 rounded-full bg-warm-rose/80 px-2 py-0.5 font-body text-[10px] font-semibold text-white">
                Main
              </span>
            )}
          </motion.div>
        ))}

        {/* Add button */}
        <AnimatePresence>
          {canAddMore && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={processing}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragActive(false)
                if (e.dataTransfer.files) handleFiles(e.dataTransfer.files)
              }}
              className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-all ${
                dragActive
                  ? 'border-warm-rose-light bg-warm-rose/10'
                  : 'border-cream/20 bg-cream/3 hover:border-cream/35 hover:bg-cream/5'
              } ${processing ? 'opacity-50' : ''}`}
            >
              {processing ? (
                <Loader2 className="h-6 w-6 text-cream/40 animate-spin" />
              ) : (
                <>
                  <ImagePlus className="h-5 w-5 text-cream/40" />
                  <span className="font-body text-[10px] text-cream/40">Add photo</span>
                </>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleInputChange}
        className="hidden"
      />

      <p className="font-body text-[11px] text-cream/40 text-center">
        {photos.length}/{maxPhotos} photos — first one is your main. Max 5MB each. Drag & drop works.
      </p>
    </div>
  )
}
