import { authBridge } from '@shared/api'

import { useSessionStore } from './sessionStore'

/**
 * Инжектит сессию в shared/api (инверсия зависимостей): shared не знает про
 * session, но получает провайдер токена, refresh и logout. Вызывается один раз
 * на старте приложения.
 */
export function bindSessionToApi(): void {
  authBridge.setTokenProvider(() => useSessionStore.getState().accessToken)
  authBridge.setRefreshHandler(() => useSessionStore.getState().refresh())
  authBridge.setLogoutHandler(() => useSessionStore.getState().clear())
}
