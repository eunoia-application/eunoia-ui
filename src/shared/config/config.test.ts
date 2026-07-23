import { describe, expect, it } from 'vitest'

import { HTTP, PATHS, QUERY, STORAGE_KEYS } from './index'

describe('config-константы', () => {
  it('storage keys с префиксом eunoia', () => {
    expect(STORAGE_KEYS.session).toContain('eunoia')
    expect(STORAGE_KEYS.theme).toContain('eunoia')
  })
  it('HTTP и QUERY имеют разумные значения', () => {
    expect(HTTP.timeoutMs).toBeGreaterThan(0)
    expect(QUERY.debounceMs).toBeGreaterThan(0)
    expect(QUERY.defaultPageSize).toBeGreaterThan(0)
  })
  it('PATHS', () => {
    expect(PATHS.auth).toBe('/auth')
    expect(PATHS.home).toBe('/')
    expect(PATHS.settings).toBe('/settings')
  })
})
