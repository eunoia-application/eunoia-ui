import { create } from 'zustand'

import { isApiError } from '@shared/api'
import type { ApiError, GrammarView, RequestStatus } from '@shared/api'

import { grammarApi } from '../api/grammarApi'

interface GrammarState {
  /** Весь ствол — правила по возрастанию CEFR. */
  rules: GrammarView[]
  listStatus: RequestStatus
  listError: ApiError | null

  /** Открытое правило с деталями (illustratedBy заполнен только здесь). */
  rule: GrammarView | null
  ruleStatus: RequestStatus
  ruleError: ApiError | null

  fetchAll: () => Promise<void>
  fetchRule: (id: string) => Promise<void>
  clearRule: () => void
  reset: () => void
}

const initial = {
  rules: [] as GrammarView[],
  listStatus: 'idle' as RequestStatus,
  listError: null as ApiError | null,
  rule: null as GrammarView | null,
  ruleStatus: 'idle' as RequestStatus,
  ruleError: null as ApiError | null,
}

export const useGrammarStore = create<GrammarState>((set) => ({
  ...initial,

  fetchAll: async () => {
    set({ listStatus: 'loading', listError: null })
    try {
      const rules = await grammarApi.listAll()
      set({ rules, listStatus: 'success' })
    } catch (error) {
      set({ listStatus: 'error', listError: isApiError(error) ? error : null })
    }
  },

  fetchRule: async (id) => {
    set({ ruleStatus: 'loading', ruleError: null, rule: null })
    try {
      const rule = await grammarApi.getRule(id)
      set({ rule, ruleStatus: 'success' })
    } catch (error) {
      set({ ruleStatus: 'error', ruleError: isApiError(error) ? error : null })
    }
  },

  clearRule: () => set({ rule: null, ruleStatus: 'idle', ruleError: null }),

  reset: () => set({ ...initial }),
}))
