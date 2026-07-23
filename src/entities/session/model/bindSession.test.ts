import { beforeEach, describe, expect, it } from 'vitest'

import { authBridge } from '@shared/api'

import { bindSessionToApi } from './bindSession'
import { useSessionStore } from './sessionStore'

describe('bindSessionToApi', () => {
  beforeEach(() => {
    useSessionStore.setState({ accessToken: null, refreshToken: null, user: null })
  })

  it('провайдер токена читает сессию', () => {
    useSessionStore.setState({ accessToken: 'tkn' })
    bindSessionToApi()
    expect(authBridge.getToken()).toBe('tkn')
  })

  it('регистрирует refresh-хэндлер', () => {
    bindSessionToApi()
    expect(authBridge.hasRefresh()).toBe(true)
  })

  it('logout-хэндлер очищает сессию', () => {
    useSessionStore.setState({ accessToken: 'tkn' })
    bindSessionToApi()
    authBridge.runLogout()
    expect(useSessionStore.getState().accessToken).toBeNull()
  })
})
