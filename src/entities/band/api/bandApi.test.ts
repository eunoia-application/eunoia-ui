import { afterEach, describe, expect, it, vi } from 'vitest'

import { httpClient } from '@shared/api'
import type * as SharedApi from '@shared/api'

import { bandApi } from './bandApi'

vi.mock('@shared/api', async (orig) => {
  const actual = await orig<typeof SharedApi>()
  return { ...actual, httpClient: { get: vi.fn() } }
})

const h = httpClient as unknown as Record<string, ReturnType<typeof vi.fn>>

afterEach(() => Object.values(h).forEach((f) => f.mockReset()))

describe('bandApi', () => {
  it('getBands', async () => {
    h.get.mockResolvedValue({ data: [{ id: 'top-100', label: 'Топ-100' }] })
    await expect(bandApi.getBands()).resolves.toHaveLength(1)
    expect(h.get).toHaveBeenCalledWith('/learning/bands')
  })
})
