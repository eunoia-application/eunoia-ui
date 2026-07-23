/** Ключи для persist в localStorage. Префикс — чтобы не конфликтовать с чужими. */
export const STORAGE_KEYS = {
  session: 'eunoia.session',
  theme: 'eunoia.theme',
} as const

/** Настройки HTTP-транспорта. */
export const HTTP = {
  timeoutMs: 20_000,
} as const

/** Значения по умолчанию для UI-взаимодействий. */
export const QUERY = {
  debounceMs: 350,
  defaultPageSize: 20,
} as const
