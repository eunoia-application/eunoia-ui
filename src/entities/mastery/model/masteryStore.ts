import { create } from 'zustand'

import { isApiError } from '@shared/api'
import type { ApiError, MasteryStatus, RequestStatus } from '@shared/api'
import { notify } from '@shared/lib'

import { masteryApi } from '../api/masteryApi'

interface MasteryState {
  /** lexemeId → статус. Оверлей поверх серверной раскраски листьев. */
  byId: Record<string, MasteryStatus>
  status: RequestStatus
  error: ApiError | null

  fetchMine: () => Promise<void>
  setStatus: (lexemeId: string, status: MasteryStatus) => Promise<void>
  reset: () => void
}

export const useMasteryStore = create<MasteryState>((set, get) => ({
  byId: {},
  status: 'idle',
  error: null,

  fetchMine: async () => {
    set({ status: 'loading', error: null })
    try {
      const items = await masteryApi.getMine()
      const byId: Record<string, MasteryStatus> = {}
      for (const item of items) byId[item.lexemeId] = item.status
      set({ byId, status: 'success' })
    } catch (error) {
      set({ status: 'error', error: isApiError(error) ? error : null })
    }
  },

  // Красим лист сразу, при ошибке возвращаем прежний статус.
  setStatus: async (lexemeId, status) => {
    const previous = get().byId[lexemeId]
    set({ byId: { ...get().byId, [lexemeId]: status } })
    try {
      const saved = await masteryApi.setStatus(lexemeId, status)
      set({ byId: { ...get().byId, [saved.lexemeId]: saved.status } })
    } catch (error) {
      const rolledBack = { ...get().byId }
      if (previous) rolledBack[lexemeId] = previous
      else delete rolledBack[lexemeId]
      set({ byId: rolledBack })
      notify.error(
        'Не удалось сохранить отметку',
        isApiError(error) ? error.message : undefined,
      )
      throw error
    }
  },

  reset: () => set({ byId: {}, status: 'idle', error: null }),
}))
