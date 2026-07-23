import { theme as antdTheme } from 'antd'
import { describe, expect, it } from 'vitest'

import { darkTheme } from './dark'
import { lightTheme } from './light'
import { brand, sharedComponents, sharedToken } from './tokens'

describe('theme configs', () => {
  it('light — defaultAlgorithm + белый фон', () => {
    expect(lightTheme.algorithm).toBe(antdTheme.defaultAlgorithm)
    expect(lightTheme.token?.colorBgBase).toBe('#FFFFFF')
  })
  it('dark — darkAlgorithm + тёмный фон', () => {
    expect(darkTheme.algorithm).toBe(antdTheme.darkAlgorithm)
    expect(darkTheme.token?.colorBgBase).toBe('#0B0E0D')
  })
  it('токены: бренд-акцент и компоненты', () => {
    expect(brand.primary).toMatch(/^#/)
    expect(sharedToken?.colorPrimary).toBe(brand.primary)
    expect(sharedComponents?.Button).toBeDefined()
  })
})
