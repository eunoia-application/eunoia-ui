import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'

import { authBridge } from './authBridge'
import type { ApiError } from './types'

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

/** Single-flight: параллельные 401 ждут один и тот же refresh. */
let refreshPromise: Promise<string | null> | null = null

function normalizeError(error: AxiosError): ApiError {
  if (error.response) {
    const data = error.response.data as Record<string, unknown> | undefined
    return {
      status: error.response.status,
      code: (data?.code as string | undefined) ?? error.code ?? 'http_error',
      message:
        (data?.message as string | undefined) ??
        error.message ??
        'Ошибка запроса',
      details: data,
    }
  }
  // сеть / timeout / abort — даём понятное сообщение вместо сырого axios-текста
  const isTimeout =
    error.code === 'ECONNABORTED' || /timeout/i.test(error.message ?? '')
  return {
    status: 0,
    code: error.code ?? (isTimeout ? 'timeout' : 'network_error'),
    message: isTimeout
      ? 'Сервер не отвечает — превышено время ожидания'
      : 'Не удалось связаться с сервером',
  }
}

export function attachInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use((config) => {
    const token = authBridge.getToken()
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as RetriableConfig | undefined
      const status = error.response?.status

      // 401 → одноразовый refresh (single-flight) → повтор исходного запроса.
      // Сами /auth/* исключаем, чтобы не зациклить refresh на его же ошибке.
      const isAuthEndpoint = config?.url?.includes('/auth/') ?? false
      if (
        status === 401 &&
        config &&
        !config._retry &&
        !isAuthEndpoint &&
        authBridge.hasRefresh()
      ) {
        config._retry = true
        try {
          refreshPromise ??= authBridge.runRefresh().finally(() => {
            refreshPromise = null
          })
          const newToken = await refreshPromise
          if (newToken) {
            config.headers.set('Authorization', `Bearer ${newToken}`)
            return client(config)
          }
        } catch {
          // refresh не удался — уходим в logout ниже
        }
        authBridge.runLogout()
      }

      return Promise.reject(normalizeError(error))
    },
  )
}
