import { useEffect, useMemo } from 'react'
import { Color, MeshStandardMaterial } from 'three'

import { BARK_OLD, BARK_YOUNG } from '../../lib/palette'
import { smoothstep } from '../../lib/math'
import { buildTubeGeometry } from '../../lib/tube'
import type { TreeSkeleton } from '../../model/skeleton'
import { getBarkTexture } from './textures'
import { applyWind, type WindUniforms } from './useWind'

interface Props {
  skeleton: TreeSkeleton
  progress: number
  wind: WindUniforms
}

/** Ствол: процедурная сужающаяся трубка с корой; молодой стебель ещё зелёный. */
export function TreeTrunk({ skeleton, progress, wind }: Props) {
  const geometry = useMemo(
    () => buildTubeGeometry([skeleton.trunk], 9, skeleton.height),
    [skeleton],
  )
  useEffect(() => () => geometry.dispose(), [geometry])

  const material = useMemo(() => {
    const m = new MeshStandardMaterial({
      map: getBarkTexture(),
      roughness: 0.88,
      metalness: 0,
    })
    applyWind(m, wind)
    return m
  }, [wind])
  useEffect(() => () => material.dispose(), [material])

  // Одревеснение: цвет коры непрерывно вызревает из травянистого в бурый.
  useEffect(() => {
    material.color = new Color(BARK_YOUNG).lerp(new Color(BARK_OLD), smoothstep(0.12, 0.5, progress))
  }, [material, progress])

  return <mesh geometry={geometry} material={material} frustumCulled={false} />
}
