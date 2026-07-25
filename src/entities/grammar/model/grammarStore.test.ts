import { beforeEach, describe, expect, it, vi } from 'vitest'

import { makeGrammarView } from '@shared/test/factories'

import { grammarApi } from '../api/grammarApi'
import { useGrammarStore } from './grammarStore'

vi.mock('../api/grammarApi', () => ({
  grammarApi: { listAll: vi.fn(), getRule: vi.fn() },
}))

const api = grammarApi as unknown as Record<string, ReturnType<typeof vi.fn>>
const store = () => useGrammarStore.getState()

beforeEach(() => {
  store().reset()
  Object.values(api).forEach((f) => f.mockReset())
})

describe('grammarStore', () => {
  it('fetchAll success', async () => {
    api.listAll.mockResolvedValue([makeGrammarView()])
    await store().fetchAll()
    expect(store().listStatus).toBe('success')
    expect(store().rules).toHaveLength(1)
  })

  it('fetchAll error (ApiError)', async () => {
    api.listAll.mockRejectedValue({ status: 500, code: 'x', message: 'm' })
    await store().fetchAll()
    expect(store().listStatus).toBe('error')
    expect(store().listError?.status).toBe(500)
  })

  it('fetchAll error (не ApiError) → error = null', async () => {
    api.listAll.mockRejectedValue(new Error('boom'))
    await store().fetchAll()
    expect(store().listError).toBeNull()
  })

  it('fetchRule success', async () => {
    api.getRule.mockResolvedValue(makeGrammarView())
    await store().fetchRule('gr:past-simple')
    expect(store().ruleStatus).toBe('success')
    expect(store().rule?.name).toBe('Past Simple')
  })

  it('fetchRule error', async () => {
    api.getRule.mockRejectedValue({ status: 404, code: 'x', message: 'm' })
    await store().fetchRule('nope')
    expect(store().ruleStatus).toBe('error')
    expect(store().ruleError?.status).toBe(404)
  })

  it('fetchRule error (не ApiError) → error = null', async () => {
    api.getRule.mockRejectedValue(new Error('boom'))
    await store().fetchRule('nope')
    expect(store().ruleError).toBeNull()
  })

  it('clearRule сбрасывает открытое правило', async () => {
    api.getRule.mockResolvedValue(makeGrammarView())
    await store().fetchRule('gr:past-simple')
    store().clearRule()
    expect(store().rule).toBeNull()
    expect(store().ruleStatus).toBe('idle')
  })

  it('reset возвращает исходное состояние', async () => {
    api.listAll.mockResolvedValue([makeGrammarView()])
    await store().fetchAll()
    store().reset()
    expect(store().rules).toEqual([])
    expect(store().listStatus).toBe('idle')
  })
})
