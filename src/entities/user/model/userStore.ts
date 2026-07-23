import { create } from 'zustand'

import { isApiError } from '@shared/api'
import type {
  ApiError,
  RequestStatus,
  UserProfile,
  UserUpdateRequest,
} from '@shared/api'
import { notify } from '@shared/lib'

import { userApi } from '../api/userApi'

interface UserState {
  profile: UserProfile | null
  status: RequestStatus
  error: ApiError | null

  fetchProfile: () => Promise<void>
  /** Оптимистичное обновление с откатом при ошибке. */
  updateProfile: (patch: UserUpdateRequest) => Promise<void>
  reset: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  status: 'idle',
  error: null,

  fetchProfile: async () => {
    set({ status: 'loading', error: null })
    try {
      const profile = await userApi.getCurrentUser()
      set({ profile, status: 'success' })
    } catch (error) {
      set({ status: 'error', error: isApiError(error) ? error : null })
    }
  },

  updateProfile: async (patch) => {
    const snapshot = get().profile
    if (snapshot) {
      // мгновенно показываем изменения
      set({ profile: { ...snapshot, ...patch } })
    }
    try {
      const updated = await userApi.updateCurrentUser(patch)
      set({ profile: updated })
      notify.success('Профиль обновлён')
    } catch (error) {
      set({ profile: snapshot }) // откат
      notify.error(
        'Не удалось обновить профиль',
        isApiError(error) ? error.message : undefined,
      )
      throw error
    }
  },

  reset: () => set({ profile: null, status: 'idle', error: null }),
}))
