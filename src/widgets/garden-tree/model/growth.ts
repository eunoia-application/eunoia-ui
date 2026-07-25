import type { Band } from '@shared/api'

import { CLUSTER_CAPACITY, MAX_BRANCHES } from '../lib/constants'
import { clamp01, lerp, smoothstep } from '../lib/math'

/**
 * Модель непрерывного роста: никаких «уровней» — каждое освоенное слово
 * чуть-чуть сдвигает единый прогресс p ∈ [0, 1], а все размеры дерева
 * плавно интерполируются от него.
 */

/** До этого числа слов дерево ещё «травянистое» — быстрая фаза роста. */
export const WORDS_SAPLING = 150
/** К этому числу слов дерево достигает полного величия (лог-шкала). */
export const WORDS_FULL = 5000

export interface TreeDims {
  /** Единый прогресс роста 0..1. */
  progress: number
  /** Активных ветвей-блоков (по данным бандов). */
  branchCount: number
  /** Высота ствола, мировые единицы. */
  height: number
  /** Радиус основания ствола. */
  baseRadius: number
  /** Мировой размер листа. */
  leafSize: number
}

export interface GrowthState extends TreeDims {
  known: number
  learning: number
  /** Тёплость света: чем больше знаний, тем теплее атмосфера. */
  warmth: number
  /** «Жизнь» вокруг дерева: интенсивность частиц и свечения. */
  life: number
}

/**
 * Слова → прогресс: до 150 слов корень из доли (первые слова меняют росток
 * заметно), дальше — логарифм до 5000 (взрослое дерево растёт степенно).
 */
export function progressOf(known: number): number {
  if (known <= 0) return 0
  if (known < WORDS_SAPLING) return 0.35 * Math.sqrt(known / WORDS_SAPLING)
  const f = Math.log10(known / WORDS_SAPLING) / Math.log10(WORDS_FULL / WORDS_SAPLING)
  return clamp01(0.35 + 0.65 * f)
}

/** Зрелость ветви i: ветви рождаются по очереди и растут плавно, без скачков. */
export function branchMaturity(progress: number, i: number): number {
  const birth = 0.08 + i * 0.13
  return smoothstep(birth, birth + 0.22, progress)
}

/** Размеры дерева из прогресса — общая точка для целевого и анимируемого состояния. */
export function dimsFromProgress(progress: number, branchCount: number): TreeDims {
  const p = clamp01(progress)
  return {
    progress: p,
    branchCount: Math.min(branchCount, MAX_BRANCHES),
    height: lerp(0.3, 3.2, p ** 1.2),
    baseRadius: lerp(0.012, 0.17, p ** 1.5),
    leafSize: lerp(0.06, 0.15, p ** 0.9),
  }
}

/** Целевое состояние роста по данным блоков слов. */
export function growthOf(bands: Band[]): GrowthState {
  const known = bands.reduce((sum, b) => sum + b.known, 0)
  const learning = bands.reduce((sum, b) => sum + b.learning, 0)
  const p = progressOf(known)
  return {
    ...dimsFromProgress(p, bands.length),
    known,
    learning,
    warmth: smoothstep(0.12, 0.9, p),
    life: smoothstep(0.04, 0.8, p),
  }
}

/**
 * Наполнение грозди: каждое слово — лист (абсолютно, не доля блока),
 * поверх освоенных — почки «Учить»; остальное — голая ветка.
 */
export function clusterFill(band: Band | undefined, cluster: number) {
  const capacity = CLUSTER_CAPACITY[cluster] ?? 0
  if (!band) return { leaves: 0, buds: 0 }
  const leaves = Math.min(band.known, capacity)
  const buds = Math.min(band.learning, capacity - leaves)
  return { leaves, buds }
}

/** Полностью освоенный блок — на его ветке зреют плоды. */
export function isBandComplete(band: Band | undefined): boolean {
  return !!band && band.total > 0 && band.known >= band.total
}
