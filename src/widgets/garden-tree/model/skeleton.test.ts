import { describe, expect, it } from 'vitest'

import { CLUSTER_CAPACITY, MAX_BRANCHES } from '../lib/constants'
import { dimsFromProgress } from './growth'
import { buildSkeleton, pointAt, radiusAt, type BranchPath } from './skeleton'

const flatten = (s: ReturnType<typeof buildSkeleton>) => [
  ...s.trunk.points,
  ...s.branches.flatMap((b) => b.points),
  ...s.slots.map((l) => l.position),
]

describe('buildSkeleton', () => {
  it('детерминирован: одно состояние роста — один и тот же скелет', () => {
    const dims = dimsFromProgress(0.6, 5)
    const a = buildSkeleton(dims)
    const b = buildSkeleton(dims)
    expect(a.trunk.points).toEqual(b.trunk.points)
    expect(a.slots.map((s) => s.position)).toEqual(b.slots.map((s) => s.position))
  })

  it('ствол растёт от земли, высота соответствует состоянию', () => {
    const s = buildSkeleton(dimsFromProgress(0.7, 5))
    expect(s.trunk.points[0].y).toBe(0)
    const top = s.trunk.points[s.trunk.points.length - 1]
    expect(top.y).toBeGreaterThan(s.height * 0.9)
    // радиус сужается к вершине
    expect(s.trunk.radii[0]).toBeGreaterThan(s.trunk.radii[s.trunk.radii.length - 1])
  })

  it('слоты листьев: полный набор с устойчивыми индексами cluster/local', () => {
    const s = buildSkeleton(dimsFromProgress(0.8, 5))
    const total = CLUSTER_CAPACITY.reduce<number>((a, b) => a + b, 0)
    expect(s.slots).toHaveLength(total)
    for (let c = 0; c < MAX_BRANCHES; c += 1) {
      const locals = s.slots.filter((l) => l.cluster === c).map((l) => l.local)
      expect(locals).toHaveLength(CLUSTER_CAPACITY[c])
      expect(new Set(locals).size).toBe(CLUSTER_CAPACITY[c])
    }
    for (const slot of s.slots) {
      expect(slot.lightT).toBeGreaterThanOrEqual(0)
      expect(slot.lightT).toBeLessThanOrEqual(1)
      expect(slot.size).toBeGreaterThan(0.5)
    }
  })

  it('меньше блоков — меньше ветвей, гроздей и слотов', () => {
    const s = buildSkeleton(dimsFromProgress(0.8, 2))
    expect(s.clusters).toHaveLength(2)
    expect(s.slots.every((l) => l.cluster < 2)).toBe(true)
    expect(buildSkeleton(dimsFromProgress(0.3, 0)).slots).toHaveLength(0)
  })

  it('рост непрерывен: взрослое дерево выше и раскидистее молодого', () => {
    const young = buildSkeleton(dimsFromProgress(0.2, 5))
    const old = buildSkeleton(dimsFromProgress(0.95, 5))
    expect(old.height).toBeGreaterThan(young.height)
    expect(old.clusters[0].radius).toBeGreaterThan(young.clusters[0].radius)
    // зрелое дерево обрастает декоративными веточками
    expect(old.branches.filter((b) => b.cluster === -1).length).toBeGreaterThan(0)
  })

  it('у ростка есть семядоли, координаты скелета конечны', () => {
    const sprout = buildSkeleton(dimsFromProgress(0.02, 5))
    expect(sprout.cotyledons).toHaveLength(2)
    for (const p of flatten(sprout)) {
      expect(Number.isFinite(p.x + p.y + p.z)).toBe(true)
    }
  })
})

describe('pointAt / radiusAt', () => {
  const path: BranchPath = buildSkeleton(dimsFromProgress(0.5, 5)).trunk

  it('края и середина полилинии', () => {
    expect(pointAt(path, 0)).toEqual(path.points[0])
    expect(pointAt(path, 1)).toEqual(path.points[path.points.length - 1])
    const mid = pointAt(path, 0.5)
    expect(mid.y).toBeGreaterThan(0)
    expect(mid.y).toBeLessThan(path.points[path.points.length - 1].y)
    expect(radiusAt(path, 0)).toBe(path.radii[0])
    expect(radiusAt(path, 1)).toBe(path.radii[path.radii.length - 1])
    expect(radiusAt(path, 0.5)).toBeLessThan(radiusAt(path, 0))
  })
})
