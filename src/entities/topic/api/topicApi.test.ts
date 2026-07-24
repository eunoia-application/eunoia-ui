import { afterEach, describe, expect, it, vi } from 'vitest'

import { httpClient } from '@shared/api'
import type * as SharedApi from '@shared/api'

import { topicApi } from './topicApi'

vi.mock('@shared/api', async (orig) => {
  const actual = await orig<typeof SharedApi>()
  return { ...actual, httpClient: { get: vi.fn() } }
})

const h = httpClient as unknown as Record<string, ReturnType<typeof vi.fn>>

afterEach(() => Object.values(h).forEach((f) => f.mockReset()))

describe('topicApi', () => {
  it('getRoots', async () => {
    h.get.mockResolvedValue({ data: [{ id: 't-1', name: 'Travel' }] })
    await expect(topicApi.getRoots()).resolves.toHaveLength(1)
    expect(h.get).toHaveBeenCalledWith('/learning/topics')
  })

  it('getView кодирует id в пути', async () => {
    h.get.mockResolvedValue({ data: { topic: { id: 'a/b', name: 'X' } } })
    await topicApi.getView('a/b')
    expect(h.get).toHaveBeenCalledWith('/learning/topics/a%2Fb')
  })
})
