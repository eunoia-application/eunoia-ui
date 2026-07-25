import { describe, expect, it } from 'vitest'

import { makeBand } from '@shared/test/factories'

import { CLUSTER_CAPACITY } from '../lib/constants'
import {
  WORDS_FULL,
  branchMaturity,
  clusterFill,
  dimsFromProgress,
  growthOf,
  isBandComplete,
  progressOf,
} from './growth'

describe('progressOf', () => {
  it('0 слов — 0, полный словарь — 1, дальше не растёт', () => {
    expect(progressOf(0)).toBe(0)
    expect(progressOf(WORDS_FULL)).toBe(1)
    expect(progressOf(WORDS_FULL * 3)).toBe(1)
  })

  it('монотонно растёт и непрерывен на стыке фаз (150 слов)', () => {
    let prev = -1
    for (const known of [0, 1, 5, 30, 100, 149, 150, 151, 400, 1000, 5000]) {
      const p = progressOf(known)
      expect(p).toBeGreaterThanOrEqual(prev)
      prev = p
    }
    expect(Math.abs(progressOf(150) - progressOf(149))).toBeLessThan(0.01)
  })

  it('первые слова заметно двигают росток', () => {
    expect(progressOf(10) - progressOf(0)).toBeGreaterThan(0.05)
  })
})

describe('branchMaturity', () => {
  it('ветви рождаются по очереди и взрослеют до 1', () => {
    expect(branchMaturity(0, 0)).toBe(0)
    expect(branchMaturity(1, 4)).toBe(1)
    // при среднем прогрессе верхняя ветвь зрелее нижней
    expect(branchMaturity(0.4, 0)).toBeGreaterThan(branchMaturity(0.4, 3))
  })
})

describe('dimsFromProgress / growthOf', () => {
  it('размеры растут непрерывно с прогрессом', () => {
    const young = dimsFromProgress(0.1, 5)
    const old = dimsFromProgress(0.9, 5)
    expect(old.height).toBeGreaterThan(young.height)
    expect(old.baseRadius).toBeGreaterThan(young.baseRadius)
    expect(old.leafSize).toBeGreaterThan(young.leafSize)
  })

  it('growthOf агрегирует блоки и ограничивает число ветвей', () => {
    const bands = Array.from({ length: 7 }, (_, i) =>
      makeBand({ id: `b${i}`, known: 100, learning: 10 }),
    )
    const g = growthOf(bands)
    expect(g.known).toBe(700)
    expect(g.learning).toBe(70)
    expect(g.branchCount).toBe(5)
    expect(g.progress).toBeGreaterThan(0)
    expect(g.warmth).toBeGreaterThan(0)
    expect(g.life).toBeGreaterThan(0)
  })

  it('пустой сад — нулевой росток', () => {
    const g = growthOf([])
    expect(g.known).toBe(0)
    expect(g.progress).toBe(0)
    expect(g.branchCount).toBe(0)
  })
})

describe('clusterFill', () => {
  it('каждое слово — лист (абсолютно), почки поверх, всё в пределах ёмкости', () => {
    expect(clusterFill(makeBand({ known: 1, learning: 2 }), 0)).toEqual({ leaves: 1, buds: 2 })
    const full = clusterFill(makeBand({ known: 5000, learning: 100 }), 0)
    expect(full.leaves).toBe(CLUSTER_CAPACITY[0])
    expect(full.buds).toBe(0)
    expect(clusterFill(undefined, 0)).toEqual({ leaves: 0, buds: 0 })
  })
})

describe('isBandComplete', () => {
  it('плоды зреют только на полностью освоенном блоке', () => {
    expect(isBandComplete(makeBand({ known: 100, total: 100 }))).toBe(true)
    expect(isBandComplete(makeBand({ known: 99, total: 100 }))).toBe(false)
    expect(isBandComplete(makeBand({ known: 0, total: 0 }))).toBe(false)
    expect(isBandComplete(undefined)).toBe(false)
  })
})
