import { beforeEach, describe, expect, it, vi } from 'vitest'

import { makeWordCard, makeWordLeaf, makeWordPage } from '@shared/test/factories'

import { wordApi } from '../api/wordApi'
import { useWordStore } from './wordStore'

vi.mock('../api/wordApi', () => ({
  wordApi: { getCard: vi.fn(), search: vi.fn(), list: vi.fn() },
}))

const api = wordApi as unknown as Record<string, ReturnType<typeof vi.fn>>
const store = () => useWordStore.getState()

beforeEach(() => {
  store().clearCard()
  store().resetList()
  Object.values(api).forEach((f) => f.mockReset())
})

describe('wordStore — карточка', () => {
  it('fetchCard success', async () => {
    api.getCard.mockResolvedValue(makeWordCard())
    await store().fetchCard('en:go')
    expect(store().cardStatus).toBe('success')
    expect(store().card?.lemma).toBe('go')
  })

  it('fetchCard error (ApiError)', async () => {
    api.getCard.mockRejectedValue({ status: 404, code: 'x', message: 'нет' })
    await store().fetchCard('en:nope')
    expect(store().cardStatus).toBe('error')
    expect(store().cardError?.message).toBe('нет')
  })

  it('fetchCard error (не ApiError) → null', async () => {
    api.getCard.mockRejectedValue(new Error('boom'))
    await store().fetchCard('x')
    expect(store().cardError).toBeNull()
  })

  it('clearCard сбрасывает карточку', async () => {
    api.getCard.mockResolvedValue(makeWordCard())
    await store().fetchCard('en:go')
    store().clearCard()
    expect(store().card).toBeNull()
  })
})

describe('wordStore — список блока', () => {
  it('selectBand грузит первую страницу', async () => {
    api.list.mockResolvedValue(makeWordPage({ total: 2, words: [makeWordLeaf()] }))
    await store().selectBand('top-100')
    expect(store().band).toBe('top-100')
    expect(store().words).toHaveLength(1)
    expect(store().total).toBe(2)
    expect(store().listStatus).toBe('success')
  })

  it('selectBand(null) грузит весь список без блока', async () => {
    api.list.mockResolvedValue(makeWordPage())
    await store().selectBand(null)
    expect(store().band).toBeNull()
    expect(api.list).toHaveBeenCalledWith({ band: undefined, offset: 0, limit: 60 })
  })

  it('selectBand error', async () => {
    api.list.mockRejectedValue({ status: 500, code: 'x', message: 'm' })
    await store().selectBand('top-100')
    expect(store().listStatus).toBe('error')
    expect(store().listError?.status).toBe(500)
  })

  it('loadMore аккумулирует следующую страницу', async () => {
    api.list.mockResolvedValueOnce(
      makeWordPage({ total: 2, words: [makeWordLeaf({ id: 'en:a', lemma: 'a' })] }),
    )
    await store().selectBand('top-100')
    api.list.mockResolvedValueOnce(
      makeWordPage({ total: 2, words: [makeWordLeaf({ id: 'en:b', lemma: 'b' })] }),
    )
    await store().loadMore()
    expect(store().words.map((w) => w.id)).toEqual(['en:a', 'en:b'])
  })

  it('loadMore ничего не делает, когда всё загружено', async () => {
    api.list.mockResolvedValue(makeWordPage({ total: 1, words: [makeWordLeaf()] }))
    await store().selectBand('top-100')
    api.list.mockClear()
    await store().loadMore()
    expect(api.list).not.toHaveBeenCalled()
  })

  it('loadMore error', async () => {
    api.list.mockResolvedValueOnce(makeWordPage({ total: 5, words: [makeWordLeaf()] }))
    await store().selectBand('top-100')
    api.list.mockRejectedValueOnce({ status: 500, code: 'x', message: 'm' })
    await store().loadMore()
    expect(store().listStatus).toBe('error')
  })

  it('resetList возвращает к исходному', async () => {
    api.list.mockResolvedValue(makeWordPage())
    await store().selectBand('top-100')
    store().resetList()
    expect(store().band).toBeNull()
    expect(store().words).toEqual([])
    expect(store().listStatus).toBe('idle')
  })
})
