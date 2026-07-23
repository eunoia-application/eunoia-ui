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
    h.get.mockResolvedValue({ data: [{ lexemeId: 'en:go:VERB', status: 'KNOWN' }] })
    await expect(masteryApi.getMine()).resolves.toHaveLength(1)
    expect(h.get).toHaveBeenCalledWith('/learning/mastery')
  })

  it('setStatus шлёт { status } на закодированный id', async () => {
    h.put.mockResolvedValue({ data: { lexemeId: 'en:go:VERB', status: 'LEARNING' } })
    await masteryApi.setStatus('en:go:VERB', 'LEARNING')
    expect(h.put).toHaveBeenCalledWith('/learning/mastery/en%3Ago%3AVERB', {
      status: 'LEARNING',
    })
  })
})
