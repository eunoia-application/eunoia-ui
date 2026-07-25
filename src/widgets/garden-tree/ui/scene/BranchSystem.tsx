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

/** Все ветви одним мешем: сгенерированные трубки с корой, качаются на ветру. */
export function BranchSystem({ skeleton, progress, wind }: Props) {
  const geometry = useMemo(
    () => buildTubeGeometry(skeleton.branches, 7, skeleton.height),
    [skeleton],
  )
  useEffect(() => () => geometry.dispose(), [geometry])

  const material = useMemo(() => {
    const m = new MeshStandardMaterial({
      map: getBarkTexture(),
      roughness: 0.9,
      metalness: 0,
    })
    applyWind(m, wind)
    return m
  }, [wind])
  useEffect(() => () => material.dispose(), [material])

  useEffect(() => {
    // Ветви чуть темнее ствола — глубина кроны читается.
    material.color = new Color(BARK_YOUNG)
      .lerp(new Color(BARK_OLD), smoothstep(0.12, 0.5, progress))
      .multiplyScalar(0.86)
  }, [material, progress])

  if (skeleton.branches.length === 0) return null
  return <mesh geometry={geometry} material={material} frustumCulled={false} />
}
