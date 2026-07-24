import { create } from 'zustand'

import { isApiError } from '@shared/api'
import type { ApiError, RequestStatus, WordCard, WordLeaf } from '@shared/api'

import { wordApi } from '../api/wordApi'

const PAGE_SIZE = 60

interface WordState {
  /** Открытая карточка слова. */
  card: WordCard | null
  cardStatus: RequestStatus
  cardError: ApiError | null
  fetchCard: (id: string) => Promise<void>
  clearCard: () => void

  /** Список слов выбранного блока (аккумулируется при догрузке). */
  band: string | null
  words: WordLeaf[]
  total: number
  listStatus: RequestStatus
  listError: ApiError | null
  /** Выбрать блок (null — весь список) и загрузить первую страницу. */
  selectBand: (band: string | null) => Promise<void>
  /** Догрузить следующую страницу текущего блока. */
  loadMore: () => Promise<void>
  resetList: () => void
}

export const useWordStore = create<WordState>((set, get) => ({
  card: null,
  cardStatus: 'idle',
  cardError: null,

  fetchCard: async (id) => {
    set({ cardStatus: 'loading', cardError: null, card: null })
    try {
      const card = await wordApi.getCard(id)
      set({ card, cardStatus: 'success' })
    } catch (error) {
      set({ cardStatus: 'error', cardError: isApiError(error) ? error : null })
    }
  },

  clearCard: () => set({ card: null, cardStatus: 'idle', cardError: null }),

  band: null,
  words: [],
  total: 0,
  listStatus: 'idle',
  listError: null,

  selectBand: async (band) => {
    set({ band, words: [], total: 0, listStatus: 'loading', listError: null })
    try {
      const page = await wordApi.list({ band: band ?? undefined, offset: 0, limit: PAGE_SIZE })
      set({ words: page.words, total: page.total, listStatus: 'success' })
    } catch (error) {
      set({ listStatus: 'error', listError: isApiError(error) ? error : null })
    }
  },

  loadMore: async () => {
    const { band, words, total, listStatus } = get()
    if (listStatus === 'loading' || words.length >= total) return
    set({ listStatus: 'loading' })
    try {
      const page = await wordApi.list({
        band: band ?? undefined,
        offset: words.length,
        limit: PAGE_SIZE,
      })
      set({ words: [...get().words, ...page.words], total: page.total, listStatus: 'success' })
    } catch (error) {
      set({ listStatus: 'error', listError: isApiError(error) ? error : null })
    }
  },

  resetList: () =>
    set({ band: null, words: [], total: 0, listStatus: 'idle', listError: null }),
}))
