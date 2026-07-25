import { afterEach, describe, expect, it, vi } from 'vitest'

import { httpClient } from '@shared/api'
import type * as SharedApi from '@shared/api'

import { masteryApi } from './masteryApi'

vi.mock('@shared/api', async (orig) => {
  const actual = await orig<typeof SharedApi>()
  return { ...actual, httpClient: { get: vi.fn(), put: vi.fn() } }
})

const h = httpClient as unknown as Record<string, ReturnType<typeof vi.fn>>

afterEach(() => Object.values(h).forEach((f) => f.mockReset()))

describe('masteryApi', () => {
  it('getMine', async () => {
    h.get.mockResolvedValue({ data: [{ wordId: 'en:go', status: 'KNOWN' }] })
    await expect(masteryApi.getMine()).resolves.toHaveLength(1)
    expect(h.get).toHaveBeenCalledWith('/learning/mastery')
  })

  it('setStatus шлёт { status } на закодированный id-лемму', async () => {
    h.put.mockResolvedValue({ data: { wordId: 'en:go', status: 'LEARNING' } })
    await masteryApi.setStatus('en:go', 'LEARNING')
    expect(h.put).toHaveBeenCalledWith('/learning/mastery/en%3Ago', { status: 'LEARNING' })
  })

  it('getStudy — очередь «Учить»', async () => {
    h.get.mockResolvedValue({ data: [{ id: 'en:go', lemma: 'go', status: 'LEARNING' }] })
    await expect(masteryApi.getStudy()).resolves.toHaveLength(1)
    expect(h.get).toHaveBeenCalledWith('/learning/study')
  })
})
