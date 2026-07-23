import { theme } from 'antd'
import { motion } from 'framer-motion'
import { useMemo } from 'react'

import { brand } from '@shared/theme'

interface LeafConfig {
  id: number
  size: number
  startX: number
  endX: number
  fallTo: number
  duration: number
  delay: number
  opacity: number
  blur: number
  color: string
}

/** Один падающий лист. Чистый презентационный компонент — без хуков. */
function Leaf({ leaf }: { leaf: LeafConfig }) {
  return (
    <motion.div
      aria-hidden
      style={{
        position: 'absolute',
        width: leaf.size,
        height: leaf.size,
        filter: `blur(${leaf.blur}px)`,
        opacity: leaf.opacity,
        pointerEvents: 'none',
      }}
      initial={{ x: leaf.startX, y: -160, rotate: 0 }}
      animate={{ x: leaf.endX, y: leaf.fallTo, rotate: 360 }}
      transition={{
        duration: leaf.duration,
        repeat: Infinity,
        ease: 'linear',
        delay: leaf.delay,
      }}
    >
      <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none">
        <path
          d="M3 14C3 8 8 3 14 3C15 10 10 15 4 15C3.5 15 3 14.5 3 14Z"
          fill={leaf.color}
        />
      </svg>
    </motion.div>
  )
}

/**
 * Фон «сад»: медленно падающие листья. Тема-адаптивный фон (через токен),
 * конфигурация листьев считается один раз. Каждый лист — свой компонент,
 * поэтому никаких хуков в цикле (исправлен баг rules-of-hooks оригинала).
 */
export function GardenBackground() {
  const { token } = theme.useToken()

  const leaves = useMemo<LeafConfig[]>(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1280
    const vh = typeof window !== 'undefined' ? window.innerHeight : 900
    const greens = [brand.primary, brand.primaryHover, brand.primaryActive]

    return Array.from({ length: 16 }, (_, i) => {
      const depth = Math.random()
      return {
        id: i,
        size: 22 + Math.random() * 34,
        startX: -120 - Math.random() * 300,
        endX: vw + 160,
        fallTo: vh + 220,
        duration: 16 + Math.random() * 14,
        delay: Math.random() * 12,
        opacity: 0.05 + depth * 0.2,
        blur: depth * 1.6,
        color: greens[i % greens.length],
      }
    })
  }, [])

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: token.colorBgLayout,
        zIndex: 0,
      }}
    >
      {leaves.map((leaf) => (
        <Leaf key={leaf.id} leaf={leaf} />
      ))}
    </div>
  )
}
