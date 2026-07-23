import { create } from 'zustand'

import { isApiError } from '@shared/api'
import type { ApiError, LexemeCard, RequestStatus } from '@shared/api'

import { lexemeApi } from '../api/lexemeApi'

interface LexemeState {
  /** Открытая карточка слова (детали листа). */
  card: LexemeCard | null
  status: RequestStatus
  error: ApiError | null

  fetchCard: (id: string) => Promise<void>
  clear: () => void
}

export const useLexemeStore = create<LexemeState>((set) => ({
  card: null,
  status: 'idle',
  error: null,

  fetchCard: async (id) => {
    set({ status: 'loading', error: null, card: null })
    try {
      const card = await lexemeApi.getCard(id)
      set({ card, status: 'success' })
    } catch (error) {
      set({ status: 'error', error: isApiError(error) ? error : null })
    }
  },

  clear: () => set({ card: null, status: 'idle', error: null }),
}))
