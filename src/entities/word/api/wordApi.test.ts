import { afterEach, describe, expect, it, vi } from 'vitest'

import { httpClient } from '@shared/api'
import type * as SharedApi from '@shared/api'

import { wordApi } from './wordApi'

vi.mock('@shared/api', async (orig) => {
  const actual = await orig<typeof SharedApi>()
  return { ...actual, httpClient: { get: vi.fn() } }
})

const h = httpClient as unknown as Record<string, ReturnType<typeof vi.fn>>

afterEach(() => Object.values(h).forEach((f) => f.mockReset()))

describe('wordApi', () => {
  it('getCard кодирует id-лемму', async () => {
    h.get.mockResolvedValue({ data: { id: 'en:go' } })
    await expect(wordApi.getCard('en:go')).resolves.toEqual({ id: 'en:go' })
    expect(h.get).toHaveBeenCalledWith('/learning/words/en%3Ago')
  })

  it('search передаёт q и limit', async () => {
    h.get.mockResolvedValue({ data: [] })
    await wordApi.search('go', 10)
    expect(h.get).toHaveBeenCalledWith('/learning/search', { params: { q: 'go', limit: 10 } })
  })

  it('list передаёт band/offset/limit', async () => {
    h.get.mockResolvedValue({ data: { total: 0, offset: 0, limit: 60, words: [] } })
    await wordApi.list({ band: 'top-100', offset: 0, limit: 60 })
    expect(h.get).toHaveBeenCalledWith('/learning/words', {
      params: { band: 'top-100', offset: 0, limit: 60 },
    })
  })
})
