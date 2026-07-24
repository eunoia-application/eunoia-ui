/** Единый источник путей приложения (доступен всем слоям как shared). */
export const PATHS = {
  auth: '/auth',
  /** Сад — визуализация дерева. */
  home: '/',
  /** Слова — блоки топ-слов и карточки. */
  words: '/words',
  /** Учить — очередь слов на повторение. */
  study: '/study',
  /** Грамматика — ствол сада. */
  grammar: '/grammar',
  /** Темы — вторичная навигация по категориям слов. */
  topics: '/topics',
  settings: '/settings',
} as const

export type AppPath = (typeof PATHS)[keyof typeof PATHS]
