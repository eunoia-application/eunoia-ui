import { beforeEach, describe, expect, it, vi } from 'vitest'

import { authBridge } from './authBridge'

describe('authBridge', () => {
  beforeEach(() => {
    authBridge.setTokenProvider(() => null)
    authBridge.setRefreshHandler(null)
    authBridge.setLogoutHandler(null)
  })

  it('токен приходит из провайдера', () => {
    expect(authBridge.getToken()).toBeNull()
    authBridge.setTokenProvider(() => 'tkn')
    expect(authBridge.getToken()).toBe('tkn')
  })

  it('refresh без хэндлера → null', async () => {
    expect(authBridge.hasRefresh()).toBe(false)
    await expect(authBridge.runRefresh()).resolves.toBeNull()
  })

  it('refresh с хэндлером', async () => {
    authBridge.setRefreshHandler(async () => 'new-token')
    expect(authBridge.hasRefresh()).toBe(true)
    await expect(authBridge.runRefresh()).resolves.toBe('new-token')
  })

  it('logout: с хэндлером вызывает, без — no-op', () => {
    const fn = vi.fn()
    authBridge.setLogoutHandler(fn)
    authBridge.runLogout()
    expect(fn).toHaveBeenCalledTimes(1)

    authBridge.setLogoutHandler(null)
    expect(() => authBridge.runLogout()).not.toThrow()
  })
})
