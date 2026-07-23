import { beforeEach, describe, expect, it, vi } from 'vitest'

import { makeAuthResponse, makeAuthUser } from '@shared/test/factories'

import { sessionApi } from '../api/sessionApi'
import { useSessionStore } from './sessionStore'

vi.mock('../api/sessionApi', () => ({
  sessionApi: {
    login: vi.fn(),
    register: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    deleteAccount: vi.fn(),
  },
}))

const api = sessionApi as unknown as Record<string, ReturnType<typeof vi.fn>>
const store = () => useSessionStore.getState()

beforeEach(() => {
  useSessionStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    status: 'idle',
    error: null,
  })
  Object.values(api).forEach((f) => f.mockReset())
  localStorage.clear()
})

describe('sessionStore', () => {
  it('login success → токены, user, status', async () => {
    api.login.mockResolvedValue(makeAuthResponse({ accessToken: 'AT', refreshToken: 'RT' }))
    await store().login({ email: 'e', password: 'p' })
    expect(store().accessToken).toBe('AT')
    expect(store().refreshToken).toBe('RT')
    expect(store().status).toBe('success')
    expect(store().isAuthenticated()).toBe(true)
  })

  it('login error (ApiError) → status error + сообщение', async () => {
    api.login.mockRejectedValue({ status: 401, code: 'x', message: 'неверно' })
    await expect(store().login({ email: 'e', password: 'p' })).rejects.toBeDefined()
    expect(store().status).toBe('error')
    expect(store().error).toBe('неверно')
  })

  it('login error (обычная) → дефолтное сообщение', async () => {
    api.login.mockRejectedValue(new Error('boom'))
    await expect(store().login({ email: 'e', password: 'p' })).rejects.toBeDefined()
    expect(store().error).toBe('Ошибка авторизации')
  })

  it('register применяет auth', async () => {
    api.register.mockResolvedValue(makeAuthResponse({ accessToken: 'R' }))
    await store().register({ email: 'e', password: 'p', username: 'u' })
    expect(store().accessToken).toBe('R')
  })

  it('applyAuth без refreshToken → null', async () => {
    api.login.mockResolvedValue(makeAuthResponse({ accessToken: 'A', refreshToken: undefined }))
    await store().login({ email: 'e', password: 'p' })
    expect(store().refreshToken).toBeNull()
  })

  it('logout success чистит', async () => {
    useSessionStore.setState({ accessToken: 'A' })
    api.logout.mockResolvedValue(undefined)
    await store().logout()
    expect(store().accessToken).toBeNull()
  })

  it('logout при ошибке api всё равно чистит', async () => {
    useSessionStore.setState({ accessToken: 'A' })
    api.logout.mockRejectedValue(new Error('x'))
    await store().logout()
    expect(store().accessToken).toBeNull()
  })

  it('refresh без токена → null', async () => {
    await expect(store().refresh()).resolves.toBeNull()
  })

  it('refresh success → новый токен', async () => {
    useSessionStore.setState({ refreshToken: 'RT' })
    api.refresh.mockResolvedValue(makeAuthResponse({ accessToken: 'NEW' }))
    await expect(store().refresh()).resolves.toBe('NEW')
    expect(store().accessToken).toBe('NEW')
  })

  it('refresh fail → clear + null', async () => {
    useSessionStore.setState({ refreshToken: 'RT', accessToken: 'OLD' })
    api.refresh.mockRejectedValue(new Error('x'))
    await expect(store().refresh()).resolves.toBeNull()
    expect(store().accessToken).toBeNull()
  })

  it('deleteAccount → api + clear', async () => {
    useSessionStore.setState({ accessToken: 'A' })
    api.deleteAccount.mockResolvedValue(undefined)
    await store().deleteAccount()
    expect(api.deleteAccount).toHaveBeenCalled()
    expect(store().accessToken).toBeNull()
  })

  it('setUser и clear', () => {
    store().setUser(makeAuthUser({ id: '42' }))
    expect(store().user?.id).toBe('42')
    store().clear()
    expect(store().user).toBeNull()
  })
})
