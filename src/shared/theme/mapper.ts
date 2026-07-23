import type { ThemePreference } from '@shared/api'

import type { ThemeMode } from './themeStore'

/** Серверная тема (LIGHT/DARK/AUTO) → локальный режим UI. */
export function themeModeFromPreference(pref: ThemePreference): ThemeMode {
  if (pref === 'LIGHT') return 'light'
  if (pref === 'DARK') return 'dark'
  return 'system'
}

/** Локальный режим UI → серверная тема. */
export function themePreferenceFromMode(mode: ThemeMode): ThemePreference {
  if (mode === 'light') return 'LIGHT'
  if (mode === 'dark') return 'DARK'
  return 'AUTO'
}
