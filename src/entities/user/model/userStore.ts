import { create } from 'zustand'

import { isApiError } from '@shared/api'
import type {
  ApiError,
  RequestStatus,
  UserProfile,
  UserSettings,
  UserUpdateRequest,
} from '@shared/api'
import { notify } from '@shared/lib'
import { themeModeFromPreference, useThemeStore } from '@shared/theme'

import { userApi } from '../api/userApi'

interface UserState {
  profile: UserProfile | null
  status: RequestStatus
  error: ApiError | null

  fetchProfile: () => Promise<void>
  /** Оптимистичное обновление профиля с откатом при ошибке. */
  updateProfile: (patch: UserUpdateRequest) => Promise<void>
  updateSettings: (settings: UserSettings) => Promise<void>
  uploadAvatar: (file: File) => Promise<void>
  deleteAvatar: () => Promise<void>
  reset: () => void
}

/** Применяет серверную тему к локальному UI. */
function syncTheme(profile: UserProfile) {
  if (profile.settings?.theme) {
    useThemeStore.getState().setMode(themeModeFromPreference(profile.settings.theme))
  }
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
      syncTheme(profile)
    } catch (error) {
      set({ status: 'error', error: isApiError(error) ? error : null })
    }
  },

  updateProfile: async (patch) => {
    const snapshot = get().profile
    if (snapshot) {
      set({ profile: { ...snapshot, ...patch } })
    }
    try {
      const updated = await userApi.updateCurrentUser(patch)
      set({ profile: updated })
      notify.success('Профиль обновлён')
    } catch (error) {
      set({ profile: snapshot })
      notify.error(
        'Не удалось обновить профиль',
        isApiError(error) ? error.message : undefined,
      )
      throw error
    }
  },

  updateSettings: async (settings) => {
    try {
      const updated = await userApi.updateSettings(settings)
      set({ profile: updated })
      syncTheme(updated)
      notify.success('Настройки сохранены')
    } catch (error) {
      notify.error(
        'Не удалось сохранить настройки',
        isApiError(error) ? error.message : undefined,
      )
      throw error
    }
  },

  uploadAvatar: async (file) => {
    try {
      const updated = await userApi.uploadAvatar(file)
      set({ profile: updated })
      notify.success('Аватар обновлён')
    } catch (error) {
      notify.error(
        'Не удалось загрузить аватар',
        isApiError(error) ? error.message : undefined,
      )
      throw error
    }
  },

  deleteAvatar: async () => {
    try {
      const updated = await userApi.deleteAvatar()
      set({ profile: updated })
      notify.success('Аватар удалён')
    } catch (error) {
      notify.error(
        'Не удалось удалить аватар',
        isApiError(error) ? error.message : undefined,
      )
      throw error
    }
  },

  reset: () => set({ profile: null, status: 'idle', error: null }),
}))
