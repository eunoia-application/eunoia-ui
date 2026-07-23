import { beforeEach, describe, expect, it, vi } from 'vitest'

import { makeMasteryView } from '@shared/test/factories'

import { masteryApi } from '../api/masteryApi'
import { useMasteryStore } from './masteryStore'

vi.mock('../api/masteryApi', () => ({
  masteryApi: { getMine: vi.fn(), setStatus: vi.fn() },
}))

const api = masteryApi as unknown as Record<string, ReturnType<typeof vi.fn>>
const store = () => useMasteryStore.getState()

beforeEach(() => {
  store().reset()
  Object.values(api).forEach((f) => f.mockReset())
})

describe('masteryStore', () => {
  it('fetchMine раскладывает отметки в byId', async () => {
    api.getMine.mockResolvedValue([
      makeMasteryView(),
      makeMasteryView({ lexemeId: 'en:run:VERB', status: 'LEARNING' }),
    ])
    await store().fetchMine()
    expect(store().status).toBe('success')
    expect(store().byId).toEqual({ 'en:go:VERB': 'KNOWN', 'en:run:VERB': 'LEARNING' })
  })

  it('fetchMine error (ApiError)', async () => {
    api.getMine.mockRejectedValue({ status: 500, code: 'x', message: 'm' })
    await store().fetchMine()
    expect(store().status).toBe('error')
    expect(store().error?.status).toBe(500)
  })

  it('fetchMine error (не ApiError) → error = null', async () => {
    api.getMine.mockRejectedValue(new Error('boom'))
    await store().fetchMine()
    expect(store().error).toBeNull()
  })

  it('setStatus красит оптимистично и подтверждает ответом сервера', async () => {
    api.setStatus.mockResolvedValue(makeMasteryView({ status: 'LEARNING' }))
    await store().setStatus('en:go:VERB', 'LEARNING')
    expect(store().byId['en:go:VERB']).toBe('LEARNING')
  })

  it('setStatus error → откат к прежней отметке', async () => {
    api.getMine.mockResolvedValue([makeMasteryView({ status: 'KNOWN' })])
    await store().fetchMine()

    api.setStatus.mockRejectedValue({ status: 500, code: 'x', message: 'm' })
    await expect(store().setStatus('en:go:VERB', 'UNKNOWN')).rejects.toBeTruthy()
    expect(store().byId['en:go:VERB']).toBe('KNOWN')
  })

  it('setStatus error без прежней отметки → ключ удаляется', async () => {
    api.setStatus.mockRejectedValue(new Error('boom'))
    await expect(store().setStatus('en:new:NOUN', 'KNOWN')).rejects.toBeTruthy()
    expect(store().byId['en:new:NOUN']).toBeUndefined()
  })

  it('reset очищает отметки', async () => {
    api.getMine.mockResolvedValue([makeMasteryView()])
    await store().fetchMine()
    store().reset()
    expect(store().byId).toEqual({})
    expect(store().status).toBe('idle')
  })
})
