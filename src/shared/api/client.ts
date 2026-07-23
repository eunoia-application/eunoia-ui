import axios from 'axios'

import { env, HTTP } from '@shared/config'

import { attachInterceptors } from './interceptors'

/**
 * Единый axios-инстанс приложения. Все API-модули entities/* ходят через него,
 * поэтому авторизация, refresh и нормализация ошибок настроены в одном месте.
 */
export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: HTTP.timeoutMs,
  headers: { 'Content-Type': 'application/json' },
})

attachInterceptors(httpClient)
