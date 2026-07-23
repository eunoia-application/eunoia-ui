import { beforeEach, describe, expect, it, vi } from 'vitest'

import { makeTopicRef, makeTopicView } from '@shared/test/factories'

import { topicApi } from '../api/topicApi'
import { useTopicStore } from './topicStore'

vi.mock('../api/topicApi', () => ({
  topicApi: { getRoots: vi.fn(), getView: vi.fn() },
}))

const api = topicApi as unknown as Record<string, ReturnType<typeof vi.fn>>
const store = () => useTopicStore.getState()

beforeEach(() => {
  store().reset()
  Object.values(api).forEach((f) => f.mockReset())
})

describe('topicStore', () => {
  it('fetchRoots success', async () => {
    api.getRoots.mockResolvedValue([makeTopicRef()])
    await store().fetchRoots()
    expect(store().rootsStatus).toBe('success')
    expect(store().roots).toHaveLength(1)
  })

  it('fetchRoots error (ApiError)', async () => {
    api.getRoots.mockRejectedValue({ status: 500, code: 'x', message: 'm' })
    await store().fetchRoots()
    expect(store().rootsStatus).toBe('error')
    expect(store().rootsError?.status).toBe(500)
  })

  it('fetchRoots error (не ApiError) → error = null', async () => {
    api.getRoots.mockRejectedValue(new Error('boom'))
    await store().fetchRoots()
    expect(store().rootsStatus).toBe('error')
    expect(store().rootsError).toBeNull()
  })

  it('fetchView success', async () => {
    api.getView.mockResolvedValue(makeTopicView())
    await store().fetchView('t-travel')
    expect(store().viewStatus).toBe('success')
    expect(store().view?.topic.name).toBe('Путешествия')
  })

  it('fetchView error', async () => {
    api.getView.mockRejectedValue({ status: 404, code: 'x', message: 'm' })
    await store().fetchView('nope')
    expect(store().viewStatus).toBe('error')
    expect(store().viewError?.status).toBe(404)
  })

  it('fetchView error (не ApiError) → error = null', async () => {
    api.getView.mockRejectedValue(new Error('boom'))
    await store().fetchView('nope')
    expect(store().viewError).toBeNull()
  })

  it('reset возвращает исходное состояние', async () => {
    api.getRoots.mockResolvedValue([makeTopicRef()])
    await store().fetchRoots()
    store().reset()
    expect(store().roots).toEqual([])
    expect(store().rootsStatus).toBe('idle')
    expect(store().view).toBeNull()
  })
})
