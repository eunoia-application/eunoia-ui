import { create } from 'zustand'

import { isApiError } from '@shared/api'
import type { ApiError, RequestStatus, TopicRef, TopicView } from '@shared/api'

import { topicApi } from '../api/topicApi'

interface TopicState {
  roots: TopicRef[]
  rootsStatus: RequestStatus
  rootsError: ApiError | null

  view: TopicView | null
  viewStatus: RequestStatus
  viewError: ApiError | null

  fetchRoots: () => Promise<void>
  fetchView: (id: string) => Promise<void>
  reset: () => void
}

const initial = {
  roots: [] as TopicRef[],
  rootsStatus: 'idle' as RequestStatus,
  rootsError: null as ApiError | null,
  view: null as TopicView | null,
  viewStatus: 'idle' as RequestStatus,
  viewError: null as ApiError | null,
}

export const useTopicStore = create<TopicState>((set) => ({
  ...initial,

  fetchRoots: async () => {
    set({ rootsStatus: 'loading', rootsError: null })
    try {
      const roots = await topicApi.getRoots()
      set({ roots, rootsStatus: 'success' })
    } catch (error) {
      set({ rootsStatus: 'error', rootsError: isApiError(error) ? error : null })
    }
  },

  fetchView: async (id) => {
    set({ viewStatus: 'loading', viewError: null })
    try {
      const view = await topicApi.getView(id)
      set({ view, viewStatus: 'success' })
    } catch (error) {
      set({ viewStatus: 'error', viewError: isApiError(error) ? error : null })
    }
  },

  reset: () => set({ ...initial }),
}))
