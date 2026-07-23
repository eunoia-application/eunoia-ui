import { beforeEach, describe, expect, it, vi } from 'vitest'

import { makeLexemeCard } from '@shared/test/factories'

import { lexemeApi } from '../api/lexemeApi'
import { useLexemeStore } from './lexemeStore'

vi.mock('../api/lexemeApi', () => ({
  lexemeApi: { getCard: vi.fn(), search: vi.fn() },
}))

const api = lexemeApi as unknown as Record<string, ReturnType<typeof vi.fn>>
const store = () => useLexemeStore.getState()

beforeEach(() => {
  store().clear()
  Object.values(api).forEach((f) => f.mockReset())
})

describe('lexemeStore', () => {
  it('fetchCard success', async () => {
    api.getCard.mockResolvedValue(makeLexemeCard())
    await store().fetchCard('en:go:VERB')
    expect(store().status).toBe('success')
    expect(store().card?.lemma).toBe('go')
  })

  it('fetchCard error (ApiError)', async () => {
    api.getCard.mockRejectedValue({ status: 404, code: 'x', message: 'нет слова' })
    await store().fetchCard('en:nope:VERB')
    expect(store().status).toBe('error')
    expect(store().error?.message).toBe('нет слова')
  })

  it('fetchCard error (не ApiError) → error = null', async () => {
    api.getCard.mockRejectedValue(new Error('boom'))
    await store().fetchCard('x')
    expect(store().error).toBeNull()
  })

  it('clear сбрасывает карточку', async () => {
    api.getCard.mockResolvedValue(makeLexemeCard())
    await store().fetchCard('en:go:VERB')
    store().clear()
    expect(store().card).toBeNull()
    expect(store().status).toBe('idle')
  })
})
