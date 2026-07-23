/** Единый источник путей приложения (доступен всем слоям как shared). */
export const PATHS = {
  auth: '/auth',
  /** Сад — визуализация дерева. */
  home: '/',
  /** Слова — темы, листья и карточки лексем. */
  words: '/words',
  /** Грамматика — ствол сада. */
  grammar: '/grammar',
  settings: '/settings',
} as const

export type AppPath = (typeof PATHS)[keyof typeof PATHS]
