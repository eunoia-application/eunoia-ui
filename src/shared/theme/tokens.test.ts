import { describe, expect, it } from 'vitest'

import { brand, fontFamily, fontFamilyCode, sharedComponents, sharedToken } from './tokens'

describe('theme tokens', () => {
  it('бренд-палитра — hex-цвета', () => {
    expect(brand.primary).toMatch(/^#[0-9A-F]{6}$/i)
    expect(brand.primaryHover).toMatch(/^#/)
    expect(brand.primaryActive).toMatch(/^#/)
  })
  it('шрифты', () => {
    expect(fontFamily).toContain('Manrope')
    expect(fontFamilyCode).toContain('mono')
  })
  it('seed-токены и компоненты', () => {
    expect(sharedToken?.borderRadius).toBeGreaterThan(0)
    expect(sharedComponents?.Menu).toBeDefined()
    expect(sharedComponents?.Form).toBeDefined()
  })
})
