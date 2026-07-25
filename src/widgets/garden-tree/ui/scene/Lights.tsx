import { useMemo } from 'react'
import { Color } from 'three'

import { brand } from '@shared/theme'

import { lerp } from '../../lib/math'

interface Props {
  dark: boolean
  /** 0..1 — чем больше знаний, тем теплее свет утреннего сада. */
  warmth: number
  /** Центр кроны — точка акцентного света. */
  crownY: number
}

/** Многослойный свет утреннего сада: небо, тёплый ключевой, холодный контровой. */
export function Lights({ dark, warmth, crownY }: Props) {
  const keyColor = useMemo(
    () => new Color('#fff6e8').lerp(new Color('#ffd9a6'), warmth),
    [warmth],
  )
  return (
    <>
      <hemisphereLight
        args={[dark ? '#3a4d42' : '#eaf4ee', dark ? '#141d18' : '#5a7263']}
        intensity={dark ? 0.55 : 0.85}
      />
      <ambientLight intensity={dark ? 0.18 : 0.3} />
      <directionalLight position={[2.6, 4.6, 3.4]} intensity={dark ? 0.85 : 1.25} color={keyColor} />
      <directionalLight position={[-3.2, 2.4, -2.4]} intensity={0.28} color="#cfe3ef" />
      {dark ? (
        <pointLight
          position={[0, crownY, 0.4]}
          color={brand.primary}
          intensity={lerp(0.35, 1.1, warmth)}
          distance={4}
        />
      ) : null}
    </>
  )
}
