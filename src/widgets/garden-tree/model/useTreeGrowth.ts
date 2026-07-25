import { useMemo } from 'react'

import type { Band } from '@shared/api'

import { growthOf, type GrowthState } from './growth'

/** Целевое состояние роста дерева по блокам слов (мемо по ссылке на данные). */
export function useTreeGrowth(bands: Band[]): GrowthState {
  return useMemo(() => growthOf(bands), [bands])
}
