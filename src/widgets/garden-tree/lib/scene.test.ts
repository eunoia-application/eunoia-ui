import { describe, expect, it } from 'vitest'

import { buildLeafSpecs, clusterLeafCounts, CLUSTERS, hitCluster, hitLeaf } from './scene'

describe('scene geometry', () => {
  const specs = buildLeafSpecs()

  it('раскладывает листья по всем гроздям, счётчики сходятся', () => {
    expect(specs.length).toBeGreaterThan(100)
    for (const s of specs) {
      expect(s.cluster).toBeGreaterThanOrEqual(0)
      expect(s.cluster).toBeLessThan(CLUSTERS.length)
    }
    const counts = clusterLeafCounts(specs)
    expect(counts).toHaveLength(CLUSTERS.length)
    expect(counts.reduce((a, b) => a + b, 0)).toBe(specs.length)
    expect(Math.min(...counts)).toBeGreaterThan(0)
  })

  it('hitCluster: центр попадает, пустота — нет, нет активных блоков — нет', () => {
    const c = CLUSTERS[0]
    expect(hitCluster(c.x, c.y, 5)).toBe(0)
    expect(hitCluster(-100, -100, 5)).toBeNull()
    expect(hitCluster(c.x, c.y, 0)).toBeNull()
  })

  it('hitCluster: гроздь за пределом count неактивна', () => {
    const c4 = CLUSTERS[4]
    expect(hitCluster(c4.x, c4.y, 5)).toBe(4)
    expect(hitCluster(c4.x, c4.y, 2)).toBeNull()
  })

  it('hitCluster: при перекрытии берётся ближайшая гроздь', () => {
    // Точка в зоне пересечения нижних гроздей 3 и 4 — ближе к 3 (меньший индекс).
    expect(hitCluster(179, 184, 5)).toBe(3)
  })

  it('hitLeaf: лист активной грозди найден, чужой и пустота — нет', () => {
    const idx = specs.findIndex((s) => s.cluster === 0)
    const leaf = specs[idx]
    expect(hitLeaf(leaf.x, leaf.y, specs, 0)).toBe(idx)
    // тот же лист, но активна другая гроздь → фильтр по cluster
    expect(hitLeaf(leaf.x, leaf.y, specs, 1)).toBeNull()
    // далеко от любого листа
    expect(hitLeaf(-100, -100, specs, 0)).toBeNull()
  })
})
