import { afterEach, describe, expect, it, vi } from 'vitest'

import { httpClient } from '@shared/api'
import type * as SharedApi from '@shared/api'

import { lexemeApi } from './lexemeApi'

vi.mock('@shared/api', async (orig) => {
  const actual = await orig<typeof SharedApi>()
  return { ...actual, httpClient: { get: vi.fn() } }
})

const h = httpClient as unknown as Record<string, ReturnType<typeof vi.fn>>

afterEach(() => Object.values(h).forEach((f) => f.mockReset()))

describe('lexemeApi', () => {
  it('getCard кодирует двоеточия в id', async () => {
    h.get.mockResolvedValue({ data: { id: 'en:go:VERB' } })
    await expect(lexemeApi.getCard('en:go:VERB')).resolves.toEqual({ id: 'en:go:VERB' })
    expect(h.get).toHaveBeenCalledWith('/learning/lexemes/en%3Ago%3AVERB')
  })

  it('search передаёт q и limit', async () => {
    h.get.mockResolvedValue({ data: [] })
    await lexemeApi.search('go', 10)
    expect(h.get).toHaveBeenCalledWith('/learning/search', { params: { q: 'go', limit: 10 } })
  })
})
