export interface AppEnv {
  /** Базовый префикс API (в dev проксируется Vite на бэкенд). */
  apiBaseUrl: string
  isDev: boolean
  isProd: boolean
}

export const env: AppEnv = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
}
