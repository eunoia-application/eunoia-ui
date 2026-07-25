import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { AdditiveBlending, type Sprite } from 'three'

import { brand } from '@shared/theme'

import { lerp, smoothstep } from '../../lib/math'
import { getRadialTexture } from './textures'

interface Props {
  dark: boolean
  progress: number
  /** Центр кроны и её радиус — свечения обнимают листву. */
  crownY: number
  crownR: number
}

/**
 * Атмосфера тёмной темы: тёплый закатный ореол за деревом и живое зелёное
 * свечение кроны (аддитивные спрайты — «дорогой» глоу без полноэкранного
 * постпроцессинга, который сломал бы прозрачный фон и уронил слабые GPU).
 * В светлой теме сцена чистая.
 */
export function Sky({ dark, progress, crownY, crownR }: Props) {
  const glowRef = useRef<Sprite>(null)
  const boost = lerp(1, 1.7, smoothstep(0.55, 1, progress))

  useFrame((state) => {
    if (glowRef.current) {
      glowRef.current.material.opacity = (0.16 + Math.sin(state.clock.elapsedTime * 0.8) * 0.045) * boost
    }
  })

  if (!dark) return null
  const warm = getRadialTexture('#ffb070')
  const glow = getRadialTexture(brand.primary)
  return (
    <>
      {warm ? (
        <sprite position={[0.3, crownY * 1.02, -1.6]} scale={[crownR * 7, crownR * 5.6, 1]}>
          <spriteMaterial
            map={warm}
            blending={AdditiveBlending}
            opacity={0.1}
            depthWrite={false}
            transparent
          />
        </sprite>
      ) : null}
      {glow ? (
        <sprite ref={glowRef} position={[0, crownY, -0.6]} scale={[crownR * 3.6, crownR * 3.1, 1]}>
          <spriteMaterial
            map={glow}
            blending={AdditiveBlending}
            opacity={0.16}
            depthWrite={false}
            transparent
          />
        </sprite>
      ) : null}
    </>
  )
}
