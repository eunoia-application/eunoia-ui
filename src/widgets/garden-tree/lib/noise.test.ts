import { describe, expect, it } from 'vitest'

import { fbm1, noise1 } from './noise'

describe('noise', () => {
  it('noise1 детерминирован и ограничен [-1, 1]', () => {
    expect(noise1(3.7)).toBe(noise1(3.7))
    for (let i = 0; i < 300; i += 1) {
      const v = noise1(i * 0.173)
      expect(Math.abs(v)).toBeLessThanOrEqual(1)
    }
  })

  it('noise1 непрерывен: соседние точки близки', () => {
    for (let i = 0; i < 50; i += 1) {
      const x = i * 0.41
      expect(Math.abs(noise1(x + 0.01) - noise1(x))).toBeLessThan(0.15)
    }
  })

  it('fbm1 ограничен и не константа', () => {
    const values = Array.from({ length: 100 }, (_, i) => fbm1(i * 0.23))
    for (const v of values) expect(Math.abs(v)).toBeLessThanOrEqual(1)
    expect(new Set(values.map((v) => v.toFixed(4))).size).toBeGreaterThan(50)
  })
})
