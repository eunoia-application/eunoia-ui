import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { authBridge } from './authBridge'
import { attachInterceptors } from './interceptors'

function makeClient(): AxiosInstance {
  const client = axios.create({ baseURL: '/api' })
  attachInterceptors(client)
  return client
}

const ok = (config: unknown) =>
  ({ data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config }) as never

const reject = (payload: Record<string, unknown>) => (config: unknown) =>
  Promise.reject({ config, isAxiosError: true, ...payload }) as never

describe('interceptors', () => {
  beforeEach(() => {
    authBridge.setTokenProvider(() => null)
    authBridge.setRefreshHandler(null)
    authBridge.setLogoutHandler(null)
  })

  it('добавляет Bearer из authBridge', async () => {
    authBridge.setTokenProvider(() => 'tok')
    const client = makeClient()
    let seen: { headers: { get: (k: string) => unknown } } | undefined
    client.defaults.adapter = async (config) => {
      seen = config as never
      return ok(config)
    }
    await client.get('/x')
    expect(seen!.headers.get('Authorization')).toBe('Bearer tok')
  })

  it('без токена — Authorization не ставится', async () => {
    const client = makeClient()
    let seen: { headers: { get: (k: string) => unknown } } | undefined
    client.defaults.adapter = async (config) => {
      seen = config as never
      return ok(config)
    }
    await client.get('/x')
    expect(seen!.headers.get('Authorization')).toBeFalsy()
  })

  it('ошибка с телом → ApiError с кодом/сообщением бэкенда', async () => {
    const client = makeClient()
    client.defaults.adapter = reject({
      response: { status: 400, data: { code: 'bad', message: 'плохо' } },
    })
    await expect(client.get('/x')).rejects.toMatchObject({
      status: 400,
      code: 'bad',
      message: 'плохо',
    })
  })

  it('ошибка без code/message → дефолты', async () => {
    const client = makeClient()
    client.defaults.adapter = reject({ response: { status: 500, data: undefined } })
    await expect(client.get('/x')).rejects.toMatchObject({
      status: 500,
      code: 'http_error',
      message: 'Ошибка запроса',
    })
  })

  it('сетевая ошибка → status 0', async () => {
    const client = makeClient()
    client.defaults.adapter = reject({ message: 'Network Error', code: 'ERR_NETWORK' })
    await expect(client.get('/x')).rejects.toMatchObject({
      status: 0,
      code: 'ERR_NETWORK',
      message: 'Не удалось связаться с сервером',
    })
  })

  it('сетевая ошибка без code → network_error', async () => {
    const client = makeClient()
    client.defaults.adapter = reject({ message: 'boom' })
    await expect(client.get('/x')).rejects.toMatchObject({ status: 0, code: 'network_error' })
  })

  it('timeout по code ECONNABORTED', async () => {
    const client = makeClient()
    client.defaults.adapter = reject({ message: 'timeout of 1000ms exceeded', code: 'ECONNABORTED' })
    await expect(client.get('/x')).rejects.toMatchObject({
      code: 'ECONNABORTED',
      message: 'Сервер не отвечает — превышено время ожидания',
    })
  })

  it('timeout по сообщению (без code)', async () => {
    const client = makeClient()
    client.defaults.adapter = reject({ message: 'timeout of 5000ms' })
    await expect(client.get('/x')).rejects.toMatchObject({
      code: 'timeout',
      message: 'Сервер не отвечает — превышено время ожидания',
    })
  })

  it('401 → refresh → повтор с новым токеном', async () => {
    authBridge.setRefreshHandler(async () => 'fresh')
    const client = makeClient()
    let calls = 0
    client.defaults.adapter = async (config) => {
      calls += 1
      if (calls === 1) return reject({ response: { status: 401, data: {} }, message: '401' })(config)
      return ok(config)
    }
    const res = await client.get('/users/me')
    expect(res.data).toEqual({ ok: true })
    expect(calls).toBe(2)
  })

  it('401 на /auth/* не триггерит refresh', async () => {
    const refresh = vi.fn(async () => 'fresh')
    authBridge.setRefreshHandler(refresh)
    const client = makeClient()
    client.defaults.adapter = reject({ response: { status: 401, data: {} }, message: '401' })
    await expect(client.post('/auth/login')).rejects.toMatchObject({ status: 401 })
    expect(refresh).not.toHaveBeenCalled()
  })

  it('401 без refresh-хэндлера → просто reject', async () => {
    const client = makeClient()
    client.defaults.adapter = reject({ response: { status: 401, data: {} }, message: '401' })
    await expect(client.get('/users/me')).rejects.toMatchObject({ status: 401 })
  })

  it('401, refresh вернул null → logout', async () => {
    const logout = vi.fn()
    authBridge.setRefreshHandler(async () => null)
    authBridge.setLogoutHandler(logout)
    const client = makeClient()
    client.defaults.adapter = reject({ response: { status: 401, data: {} }, message: '401' })
    await expect(client.get('/users/me')).rejects.toMatchObject({ status: 401 })
    expect(logout).toHaveBeenCalled()
  })

  it('401, refresh бросил → catch → logout', async () => {
    const logout = vi.fn()
    authBridge.setRefreshHandler(async () => {
      throw new Error('refresh failed')
    })
    authBridge.setLogoutHandler(logout)
    const client = makeClient()
    client.defaults.adapter = reject({ response: { status: 401, data: {} }, message: '401' })
    await expect(client.get('/users/me')).rejects.toMatchObject({ status: 401 })
    expect(logout).toHaveBeenCalled()
  })
})
