import type { Band } from '@shared/api'

import type { GrowthState } from '../../model/growth'
import type { GardenPick } from '../GardenTree'

/** Пропсы 3D-сцены сада — данные вниз, события наведения/клика наверх. */
export interface SceneProps {
  bands: Band[]
  growth: GrowthState
  dark: boolean
  /** prefers-reduced-motion: минимум движения. */
  calm: boolean
  onPick: (pick: GardenPick | null) => void
  onSelect: (pick: GardenPick) => void
}
