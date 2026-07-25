import { beforeEach, describe, expect, it, vi } from 'vitest'

import { makeBand } from '@shared/test/factories'

import { bandApi } from '../api/bandApi'
import { useBandStore } from './bandStore'

vi.mock('../api/bandApi', () => ({ bandApi: { getBands: vi.fn() } }))

const api = bandApi as unknown as Record<string, ReturnType<typeof vi.fn>>
const store = () => useBandStore.getState()

beforeEach(() => {
  store().reset()
  Object.values(api).forEach((f) => f.mockReset())
})

describe('bandStore', () => {
  it('fetchBands success', async () => {
    api.getBands.mockResolvedValue([makeBand()])
    await store().fetchBands()
    expect(store().status).toBe('success')
    expect(store().bands).toHaveLength(1)
  })

  it('fetchBands error (ApiError)', async () => {
    api.getBands.mockRejectedValue({ status: 500, code: 'x', message: 'm' })
    await store().fetchBands()
    expect(store().status).toBe('error')
    expect(store().error?.status).toBe(500)
  })

  it('fetchBands error (не ApiError) → error = null', async () => {
    api.getBands.mockRejectedValue(new Error('boom'))
    await store().fetchBands()
    expect(store().error).toBeNull()
  })

  it('reset', async () => {
    api.getBands.mockResolvedValue([makeBand()])
    await store().fetchBands()
    store().reset()
    expect(store().bands).toEqual([])
    expect(store().status).toBe('idle')
  })
})
