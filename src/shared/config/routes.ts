/** Единый источник путей приложения (доступен всем слоям как shared). */
export const PATHS = {
  auth: '/auth',
  home: '/',
  settings: '/settings',
} as const

export type AppPath = (typeof PATHS)[keyof typeof PATHS]
