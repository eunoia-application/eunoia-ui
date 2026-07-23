/**
 * Мост между shared/api и верхними слоями (entities/session).
 *
 * FSD запрещает shared импортировать entities, но интерсептору нужен токен
 * и механизм refresh. Поэтому shared лишь предоставляет слоты, а session
 * сверху инжектит в них реализацию (инверсия зависимостей).
 */
type TokenProvider = () => string | null
type RefreshHandler = () => Promise<string | null>
type LogoutHandler = () => void

let tokenProvider: TokenProvider = () => null
let refreshHandler: RefreshHandler | null = null
let logoutHandler: LogoutHandler | null = null

export const authBridge = {
  setTokenProvider(fn: TokenProvider): void {
    tokenProvider = fn
  },
  getToken(): string | null {
    return tokenProvider()
  },

  setRefreshHandler(fn: RefreshHandler | null): void {
    refreshHandler = fn
  },
  hasRefresh(): boolean {
    return refreshHandler !== null
  },
  runRefresh(): Promise<string | null> {
    return refreshHandler ? refreshHandler() : Promise.resolve(null)
  },

  setLogoutHandler(fn: LogoutHandler | null): void {
    logoutHandler = fn
  },
  runLogout(): void {
    logoutHandler?.()
  },
}
