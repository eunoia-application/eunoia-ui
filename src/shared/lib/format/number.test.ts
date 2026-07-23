import { describe, expect, it } from 'vitest'

import { formatNumber, formatPercent } from './number'

// Intl использует неразрывные пробелы как разделитель разрядов; \s матчит и их.
const normalizeSpaces = (s: string) => s.replace(/\s/g, ' ')

describe('formatNumber', () => {
  it('группирует разряды', () => {
    expect(normalizeSpaces(formatNumber(1234567))).toBe('1 234 567')
  })
  it('0 → «0»', () => {
    expect(formatNumber(0)).toBe('0')
  })
  it('undefined → «—»', () => {
    expect(formatNumber(undefined)).toBe('—')
  })
})

describe('formatPercent', () => {
  it('доля → проценты', () => {
    expect(normalizeSpaces(formatPercent(0.42))).toBe('42 %')
  })
  it('дробные знаки', () => {
    expect(normalizeSpaces(formatPercent(0.1234, 1))).toBe('12.3 %')
  })
  it('undefined → «—»', () => {
    expect(formatPercent(undefined)).toBe('—')
  })
})
