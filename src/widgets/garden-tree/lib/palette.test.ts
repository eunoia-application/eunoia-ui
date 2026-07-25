import { describe, expect, it } from 'vitest'

import { LEAF_DARK, LEAF_LIGHT, LEAF_MID, hexToRgb, leafShade, mixRgb } from './palette'

describe('palette', () => {
  it('hexToRgb разбирает цвет в доли [0, 1]', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 1, g: 1, b: 1 })
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
    expect(hexToRgb('#ff0000')).toEqual({ r: 1, g: 0, b: 0 })
  })

  it('mixRgb смешивает линейно', () => {
    const m = mixRgb({ r: 0, g: 0, b: 0 }, { r: 1, g: 0.5, b: 0 }, 0.5)
    expect(m.r).toBeCloseTo(0.5)
    expect(m.g).toBeCloseTo(0.25)
    expect(m.b).toBe(0)
  })

  it('leafShade: тень → базовый → солнечный по вертикальному свету', () => {
    expect(leafShade(0)).toEqual(hexToRgb(LEAF_DARK))
    expect(leafShade(0.5)).toEqual(hexToRgb(LEAF_MID))
    expect(leafShade(1)).toEqual(hexToRgb(LEAF_LIGHT))
    // вне диапазона — зажимается
    expect(leafShade(-1)).toEqual(hexToRgb(LEAF_DARK))
    expect(leafShade(2)).toEqual(hexToRgb(LEAF_LIGHT))
  })
})
