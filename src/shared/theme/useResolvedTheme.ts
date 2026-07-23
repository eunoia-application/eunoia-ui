import { useMediaQuery } from '@shared/lib'

import { useThemeStore } from './themeStore'

export type ResolvedTheme = 'light' | 'dark'

/** Разворачивает режим темы: 'system' → фактический light/dark по ОС. */
export function useResolvedTheme(): ResolvedTheme {
  const mode = useThemeStore((state) => state.mode)
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')

  if (mode === 'system') return prefersDark ? 'dark' : 'light'
  return mode
}
