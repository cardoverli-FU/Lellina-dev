'use client'

import { motion } from 'framer-motion'

export function Logo({ size = 'md', variant = 'light' }: { size?: 'sm' | 'md' | 'lg' | 'xl'; variant?: 'light' | 'dark' }) {
  const sizeMap = {
    sm: { container: 'w-8 h-8', text: 'text-lg' },
    md: { container: 'w-12 h-12', text: 'text-2xl' },
    lg: { container: 'w-16 h-16', text: 'text-3xl' },
    xl: { container: 'w-24 h-24', text: 'text-5xl' },
  }

  const s = sizeMap[size]
  const textColor = variant === 'dark' ? 'text-white' : 'text-soft-charcoal'

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* SVG Logo Icon - Stylized L with rose petal */}
      <div className={`${s.container} relative`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Rose petal shape */}
          <path
            d="M50 10C50 10 75 25 75 50C75 65 65 75 50 75C35 75 25 65 25 50C25 25 50 10 50 10Z"
            fill="#D4889E"
            opacity="0.3"
          />
          <path
            d="M50 20C50 20 65 30 65 50C65 60 58 68 50 68C42 68 35 60 35 50C35 30 50 20 50 20Z"
            fill="#D4889E"
            opacity="0.6"
          />
          {/* Stylized L */}
          <path
            d="M38 25V62C38 67 42 72 50 72H65"
            stroke={variant === 'dark' ? '#FFFFFF' : '#9D3B54'}
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          {/* Small rose bud accent */}
          <circle cx="65" cy="72" r="4" fill="#B8923D" />
          <circle cx="62" cy="68" r="3" fill="#D4889E" opacity="0.8" />
          <circle cx="68" cy="68" r="3" fill="#D4889E" opacity="0.6" />
        </svg>
      </div>

      {/* Logo Text */}
      <span className={`${s.text} font-bold tracking-tight ${textColor} font-display`}>
        Lellina
      </span>
    </motion.div>
  )
}
