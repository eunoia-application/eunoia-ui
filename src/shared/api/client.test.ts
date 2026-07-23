import { describe, expect, it } from 'vitest'

import { httpClient } from './client'

describe('httpClient', () => {
  it('создан с baseURL и timeout', () => {
    expect(httpClient.defaults.baseURL).toBeTruthy()
    expect(httpClient.defaults.timeout).toBeGreaterThan(0)
  })
  it('имеет методы http', () => {
    expect(typeof httpClient.get).toBe('function')
    expect(typeof httpClient.post).toBe('function')
    expect(typeof httpClient.put).toBe('function')
    expect(typeof httpClient.delete).toBe('function')
  })
})
