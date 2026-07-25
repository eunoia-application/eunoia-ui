import { create } from 'zustand'

import { isApiError } from '@shared/api'
import type { ApiError, MasteryStatus, RequestStatus, WordLeaf } from '@shared/api'
import { notify } from '@shared/lib'

import { masteryApi } from '../api/masteryApi'

interface MasteryState {
  /** wordId → статус. Оверлей поверх серверной раскраски. */
  byId: Record<string, MasteryStatus>
  status: RequestStatus
  error: ApiError | null

  /** Очередь «Учить». */
  study: WordLeaf[]
  studyStatus: RequestStatus
  studyError: ApiError | null

  fetchMine: () => Promise<void>
  setStatus: (wordId: string, status: MasteryStatus) => Promise<void>
  fetchStudy: () => Promise<void>
  reset: () => void
}

export const useMasteryStore = create<MasteryState>((set, get) => ({
  byId: {},
  status: 'idle',
  error: null,
  study: [],
  studyStatus: 'idle',
  studyError: null,

  fetchMine: async () => {
    set({ status: 'loading', error: null })
    try {
      const items = await masteryApi.getMine()
      const byId: Record<string, MasteryStatus> = {}
      for (const item of items) byId[item.wordId] = item.status
      set({ byId, status: 'success' })
    } catch (error) {
      set({ status: 'error', error: isApiError(error) ? error : null })
    }
  },

  // Красим слово сразу, при ошибке возвращаем прежний статус.
  setStatus: async (wordId, status) => {
    const previous = get().byId[wordId]
    set({ byId: { ...get().byId, [wordId]: status } })
    try {
      const saved = await masteryApi.setStatus(wordId, status)
      set({ byId: { ...get().byId, [saved.wordId]: saved.status } })
    } catch (error) {
      const rolledBack = { ...get().byId }
      if (previous) rolledBack[wordId] = previous
      else delete rolledBack[wordId]
      set({ byId: rolledBack })
      notify.error(
        'Не удалось сохранить отметку',
        isApiError(error) ? error.message : undefined,
      )
      throw error
    }
  },

  fetchStudy: async () => {
    set({ studyStatus: 'loading', studyError: null })
    try {
      const study = await masteryApi.getStudy()
      set({ study, studyStatus: 'success' })
    } catch (error) {
      set({ studyStatus: 'error', studyError: isApiError(error) ? error : null })
    }
  },

  reset: () =>
    set({
      byId: {},
      status: 'idle',
      error: null,
      study: [],
      studyStatus: 'idle',
      studyError: null,
    }),
}))
