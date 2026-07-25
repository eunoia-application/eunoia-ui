import { describe, expect, it } from 'vitest'

import { clamp, clamp01, easeOutCubic, hash01, lerp, smoothstep } from './math'

describe('math', () => {
  it('clamp/clamp01 держат значение в границах', () => {
    expect(clamp(5, 0, 3)).toBe(3)
    expect(clamp(-2, 0, 3)).toBe(0)
    expect(clamp(1, 0, 3)).toBe(1)
    expect(clamp01(1.5)).toBe(1)
    expect(clamp01(-1)).toBe(0)
  })

  it('lerp интерполирует линейно', () => {
    expect(lerp(0, 10, 0.5)).toBe(5)
    expect(lerp(2, 4, 0)).toBe(2)
    expect(lerp(2, 4, 1)).toBe(4)
  })

  it('smoothstep: 0 до порога, 1 после, монотонно между', () => {
    expect(smoothstep(0.2, 0.8, 0)).toBe(0)
    expect(smoothstep(0.2, 0.8, 1)).toBe(1)
    expect(smoothstep(0.2, 0.8, 0.5)).toBeCloseTo(0.5, 5)
    expect(smoothstep(0.2, 0.8, 0.4)).toBeLessThan(smoothstep(0.2, 0.8, 0.6))
  })

  it('easeOutCubic: быстро в начале, 1 в конце', () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5)
  })

  it('hash01 детерминирован и лежит в [0, 1)', () => {
    expect(hash01(1, 2, 3)).toBe(hash01(1, 2, 3))
    expect(hash01(1, 2, 3)).not.toBe(hash01(3, 2, 1))
    for (let i = 0; i < 200; i += 1) {
      const v = hash01(i, i * 0.37)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})
