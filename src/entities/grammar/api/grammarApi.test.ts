import { afterEach, describe, expect, it, vi } from 'vitest'

import { httpClient } from '@shared/api'
import type * as SharedApi from '@shared/api'

import { grammarApi } from './grammarApi'

vi.mock('@shared/api', async (orig) => {
  const actual = await orig<typeof SharedApi>()
  return { ...actual, httpClient: { get: vi.fn() } }
})

const h = httpClient as unknown as Record<string, ReturnType<typeof vi.fn>>

afterEach(() => Object.values(h).forEach((f) => f.mockReset()))

describe('grammarApi', () => {
  it('listAll', async () => {
    h.get.mockResolvedValue({ data: [{ id: 'gr:1', name: 'X' }] })
    await expect(grammarApi.listAll()).resolves.toHaveLength(1)
    expect(h.get).toHaveBeenCalledWith('/learning/grammar')
  })

  it('getRule кодирует id в пути', async () => {
    h.get.mockResolvedValue({ data: { id: 'gr:past/simple', name: 'X' } })
    await grammarApi.getRule('gr:past/simple')
    expect(h.get).toHaveBeenCalledWith('/learning/grammar/gr%3Apast%2Fsimple')
  })
})
