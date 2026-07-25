import { describe, expect, it } from 'vitest'

import { buildLeafGeometry } from './leafGeometry'

describe('buildLeafGeometry', () => {
  it('лист растёт из черешка вдоль +Y, длина 1', () => {
    const geo = buildLeafGeometry()
    geo.computeBoundingBox()
    const box = geo.boundingBox
    expect(box).toBeTruthy()
    expect(box!.min.y).toBeCloseTo(0, 3)
    expect(box!.max.y).toBeCloseTo(1, 3)
    // силуэт симметричен по X
    expect(box!.max.x).toBeCloseTo(-box!.min.x, 2)
  })

  it('продольный изгиб даёт объём (z не плоский), нормали пересчитаны', () => {
    const geo = buildLeafGeometry(0.2)
    geo.computeBoundingBox()
    expect(geo.boundingBox!.max.z - geo.boundingBox!.min.z).toBeGreaterThan(0.05)
    expect(geo.getAttribute('normal')).toBeTruthy()
    const flat = buildLeafGeometry(0)
    flat.computeBoundingBox()
    expect(flat.boundingBox!.max.z - flat.boundingBox!.min.z).toBeLessThan(1e-6)
  })
})
