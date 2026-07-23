import { afterEach, describe, expect, it, vi } from 'vitest'

import { httpClient } from '@shared/api'
import type * as SharedApi from '@shared/api'

import { sessionApi } from './sessionApi'

vi.mock('@shared/api', async (orig) => {
  const actual = await orig<typeof SharedApi>()
  return { ...actual, httpClient: { post: vi.fn(), delete: vi.fn() } }
})

const post = httpClient.post as unknown as ReturnType<typeof vi.fn>
const del = httpClient.delete as unknown as ReturnType<typeof vi.fn>

afterEach(() => {
  post.mockReset()
  del.mockReset()
})

describe('sessionApi', () => {
  it('login', async () => {
    post.mockResolvedValue({ data: { accessToken: 'a' } })
    await expect(sessionApi.login({ email: 'e', password: 'p' })).resolves.toEqual({
      accessToken: 'a',
    })
    expect(post).toHaveBeenCalledWith('/auth/login', { email: 'e', password: 'p' })
  })

  it('register', async () => {
    post.mockResolvedValue({ data: {} })
    await sessionApi.register({ email: 'e', password: 'p', username: 'u' })
    expect(post).toHaveBeenCalledWith('/auth/register', {
      email: 'e',
      password: 'p',
      username: 'u',
    })
  })

  it('refresh', async () => {
    post.mockResolvedValue({ data: {} })
    await sessionApi.refresh({ refreshToken: 'r' })
    expect(post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'r' })
  })

  it('logout', async () => {
    post.mockResolvedValue({ data: undefined })
    await sessionApi.logout()
    expect(post).toHaveBeenCalledWith('/auth/logout')
  })

  it('deleteAccount', async () => {
    del.mockResolvedValue({ data: undefined })
    await sessionApi.deleteAccount()
    expect(del).toHaveBeenCalledWith('/auth/account')
  })
})
