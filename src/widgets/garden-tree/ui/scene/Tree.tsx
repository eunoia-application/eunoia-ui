import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'

import type { Band } from '@shared/api'

import type { GrowthState, TreeDims } from '../../model/growth'
import type { TreeSkeleton } from '../../model/skeleton'
import type { GardenPick } from '../GardenTree'
import { BranchSystem } from './BranchSystem'
import { LeafSystem } from './LeafSystem'
import { TreeTrunk } from './TreeTrunk'
import type { WindUniforms } from './useWind'

interface Props {
  skeleton: TreeSkeleton
  dims: TreeDims
  bands: Band[]
  growth: GrowthState
  calm: boolean
  wind: WindUniforms
  onPick: (pick: GardenPick | null) => void
  onSelect: (pick: GardenPick) => void
}

/** Дерево целиком: ствол, ветви и крона; всё вместе едва дышит на ветру. */
export function Tree({ skeleton, dims, bands, growth, calm, wind, onPick, onSelect }: Props) {
  const group = useRef<Group>(null)

  useFrame(() => {
    if (!group.current) return
    // Едва заметное общее покачивание — усиливает шейдерный ветер ветвей.
    group.current.rotation.z = Math.sin(wind.uTime.value * 0.6) * wind.uWind.value * 0.16
  })

  return (
    <group ref={group}>
      <TreeTrunk skeleton={skeleton} progress={dims.progress} wind={wind} />
      <BranchSystem skeleton={skeleton} progress={dims.progress} wind={wind} />
      <LeafSystem
        skeleton={skeleton}
        dims={dims}
        bands={bands}
        growth={growth}
        calm={calm}
        wind={wind}
        onPick={onPick}
        onSelect={onSelect}
      />
    </group>
  )
}
