import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import { MathUtils } from 'three'

import { dimsFromProgress } from '../../model/growth'
import { buildSkeleton } from '../../model/skeleton'
import { CameraRig } from './CameraRig'
import { Fireflies } from './Fireflies'
import { FloatingParticles } from './FloatingParticles'
import { Ground } from './Ground'
import { Lights } from './Lights'
import { Sky } from './Sky'
import { Tree } from './Tree'
import type { SceneProps } from './types'
import { useWind } from './useWind'

/**
 * Сцена сада: анимируемый прогресс плавно догоняет целевой (каждое новое слово
 * чуть-чуть двигает дерево), скелет перестраивается маленькими шагами —
 * рост непрерывный, без стадий-переключений.
 */
export function GardenScene({ bands, growth, dark, calm, onPick, onSelect }: SceneProps) {
  // Стартуем чуть «моложе» цели — дерево едва заметно дорастает при входе.
  const anim = useRef({
    p: Math.max(0, growth.progress - 0.035),
    branches: growth.branchCount,
  })
  const [dims, setDims] = useState(() => dimsFromProgress(anim.current.p, growth.branchCount))
  const built = useRef(dims)

  useFrame((_, dt) => {
    const a = anim.current
    a.p = MathUtils.damp(a.p, growth.progress, 1.1, dt)
    a.branches = growth.branchCount
    const settled = Math.abs(a.p - growth.progress) < 0.0004
    if (settled) a.p = growth.progress
    const drift = Math.abs(a.p - built.current.progress)
    const branchesChanged = growth.branchCount !== built.current.branchCount
    // Перестраиваем скелет мелкими шагами пока дерево растёт; в конце — точный снап.
    if (branchesChanged || drift > 0.004 || (settled && drift > 1e-6)) {
      const next = dimsFromProgress(a.p, growth.branchCount)
      built.current = next
      setDims(next)
    }
  })

  const skeleton = useMemo(() => buildSkeleton(dims), [dims])
  // Росток почти не гнётся; взрослая крона дышит в полную силу.
  const wind = useWind(calm, Math.min(1, 0.25 + dims.height / 2.5))

  const crownY = skeleton.height * 0.78
  const crownR = Math.max(
    0.22,
    skeleton.clusters.reduce((m, z) => Math.max(m, z.radius), 0) * 1.5,
  )

  return (
    <>
      <Lights dark={dark} warmth={growth.warmth} crownY={crownY} />
      <Sky dark={dark} progress={growth.progress} crownY={crownY} crownR={crownR} />
      <Ground dark={dark} crownR={crownR} />
      <Tree
        skeleton={skeleton}
        dims={dims}
        bands={bands}
        growth={growth}
        calm={calm}
        wind={wind}
        onPick={onPick}
        onSelect={onSelect}
      />
      <Fireflies dark={dark} life={growth.life} calm={calm} crownY={crownY} crownR={crownR} />
      <FloatingParticles dark={dark} life={growth.life} calm={calm} crownY={crownY} crownR={crownR} />
      <CameraRig anim={anim} calm={calm} />
    </>
  )
}
