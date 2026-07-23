import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('env', () => {
  it('берёт apiBaseUrl из VITE_API_BASE_URL', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '/api/v9')
    vi.resetModules()
    const { env } = await import('./env')
    expect(env.apiBaseUrl).toBe('/api/v9')
    expect(typeof env.isDev).toBe('boolean')
    expect(typeof env.isProd).toBe('boolean')
  })

  it('фоллбэк на «/api» когда переменная пуста', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '')
    vi.resetModules()
    const { env } = await import('./env')
    expect(env.apiBaseUrl).toBe('/api')
  })
})
