export type ID = string

/**
 * Нормализованная ошибка API. Любой сбой транспорта/сервера приводится
 * к этой форме в response-интерсепторе, чтобы UI не разбирал axios-детали.
 */
export interface ApiError {
  /** HTTP-статус; 0 — сеть/timeout/abort. */
  status: number
  /** Машиночитаемый код (из тела бэкенда либо axios). */
  code: string
  /** Человекочитаемое сообщение. */
  message: string
  /** Сырое тело ошибки бэкенда, если было. */
  details?: unknown
}

/** Состояние асинхронной операции для стора/UI. */
export type RequestStatus = 'idle' | 'loading' | 'success' | 'error'

/** Универсальная страница списка. */
export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

/** Type-guard: распознать нормализованную ошибку API. */
export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'code' in value &&
    'message' in value
  )
}
