import { describe, expect, it } from 'vitest'

import { formatDate, formatDateTime, fromNow } from './date'

describe('date format', () => {
  it('formatDate: ISO → строка с годом', () => {
    expect(formatDate('2026-07-05')).toContain('2026')
  })
  it('formatDate: undefined → «—»', () => {
    expect(formatDate(undefined)).toBe('—')
  })
  it('formatDateTime: содержит время', () => {
    expect(formatDateTime('2026-07-05T14:30:00')).toMatch(/14:30/)
  })
  it('formatDateTime: undefined → «—»', () => {
    expect(formatDateTime(undefined)).toBe('—')
  })
  it('fromNow: относительная строка', () => {
    expect(fromNow('2020-01-01')).not.toBe('—')
    expect(typeof fromNow('2020-01-01')).toBe('string')
  })
  it('fromNow: undefined → «—»', () => {
    expect(fromNow(undefined)).toBe('—')
  })
})
