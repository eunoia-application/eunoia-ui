import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { STORAGE_KEYS } from '@shared/config'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggle: () => void
}

/** Глобальный выбор темы (persist в localStorage). */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
      toggle: () => set({ mode: get().mode === 'dark' ? 'light' : 'dark' }),
    }),
    { name: STORAGE_KEYS.theme },
  ),
)
