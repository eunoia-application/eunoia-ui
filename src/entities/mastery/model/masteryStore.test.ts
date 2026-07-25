import { beforeEach, describe, expect, it, vi } from 'vitest'

import { makeMasteryView, makeWordLeaf } from '@shared/test/factories'

import { masteryApi } from '../api/masteryApi'
import { useMasteryStore } from './masteryStore'

vi.mock('../api/masteryApi', () => ({
  masteryApi: { getMine: vi.fn(), setStatus: vi.fn(), getStudy: vi.fn() },
}))

const api = masteryApi as unknown as Record<string, ReturnType<typeof vi.fn>>
const store = () => useMasteryStore.getState()

beforeEach(() => {
  store().reset()
  Object.values(api).forEach((f) => f.mockReset())
})

describe('masteryStore', () => {
  it('fetchMine раскладывает отметки в byId по wordId', async () => {
    api.getMine.mockResolvedValue([
      makeMasteryView(),
      makeMasteryView({ wordId: 'en:run', status: 'LEARNING' }),
    ])
    await store().fetchMine()
    expect(store().status).toBe('success')
    expect(store().byId).toEqual({ 'en:go': 'KNOWN', 'en:run': 'LEARNING' })
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

  it('setStatus красит оптимистично и подтверждает ответом', async () => {
    api.setStatus.mockResolvedValue(makeMasteryView({ status: 'LEARNING' }))
    await store().setStatus('en:go', 'LEARNING')
    expect(store().byId['en:go']).toBe('LEARNING')
  })

  it('setStatus error → откат к прежней отметке', async () => {
    api.getMine.mockResolvedValue([makeMasteryView({ status: 'KNOWN' })])
    await store().fetchMine()

    api.setStatus.mockRejectedValue({ status: 500, code: 'x', message: 'm' })
    await expect(store().setStatus('en:go', 'UNKNOWN')).rejects.toBeTruthy()
    expect(store().byId['en:go']).toBe('KNOWN')
  })

  it('setStatus error без прежней отметки → ключ удаляется', async () => {
    api.setStatus.mockRejectedValue(new Error('boom'))
    await expect(store().setStatus('en:new', 'KNOWN')).rejects.toBeTruthy()
    expect(store().byId['en:new']).toBeUndefined()
  })

  it('fetchStudy наполняет очередь «Учить»', async () => {
    api.getStudy.mockResolvedValue([makeWordLeaf({ status: 'LEARNING' })])
    await store().fetchStudy()
    expect(store().studyStatus).toBe('success')
    expect(store().study).toHaveLength(1)
  })

  it('fetchStudy error (ApiError)', async () => {
    api.getStudy.mockRejectedValue({ status: 500, code: 'x', message: 'm' })
    await store().fetchStudy()
    expect(store().studyStatus).toBe('error')
    expect(store().studyError?.status).toBe(500)
  })

  it('fetchStudy error (не ApiError) → error = null', async () => {
    api.getStudy.mockRejectedValue(new Error('boom'))
    await store().fetchStudy()
    expect(store().studyError).toBeNull()
  })

  it('reset очищает отметки и очередь', async () => {
    api.getMine.mockResolvedValue([makeMasteryView()])
    await store().fetchMine()
    store().reset()
    expect(store().byId).toEqual({})
    expect(store().study).toEqual([])
  })
})
