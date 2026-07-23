import { afterEach, describe, expect, it, vi } from 'vitest'

import { httpClient } from '@shared/api'
import type * as SharedApi from '@shared/api'

import { userApi } from './userApi'

vi.mock('@shared/api', async (orig) => {
  const actual = await orig<typeof SharedApi>()
  return {
    ...actual,
    httpClient: { get: vi.fn(), put: vi.fn(), post: vi.fn(), delete: vi.fn() },
  }
})

const h = httpClient as unknown as Record<string, ReturnType<typeof vi.fn>>

afterEach(() => Object.values(h).forEach((f) => f.mockReset()))

describe('userApi', () => {
  it('getCurrentUser', async () => {
    h.get.mockResolvedValue({ data: { id: '1' } })
    await expect(userApi.getCurrentUser()).resolves.toEqual({ id: '1' })
    expect(h.get).toHaveBeenCalledWith('/users/me')
  })

  it('updateCurrentUser', async () => {
    h.put.mockResolvedValue({ data: { id: '1' } })
    await userApi.updateCurrentUser({ firstName: 'A' })
    expect(h.put).toHaveBeenCalledWith('/users/me', { firstName: 'A' })
  })

  it('updateSettings', async () => {
    h.put.mockResolvedValue({ data: { id: '1' } })
    await userApi.updateSettings({ theme: 'DARK' } as never)
    expect(h.put).toHaveBeenCalledWith('/users/me/settings', { theme: 'DARK' })
  })

  it('uploadAvatar → FormData с file', async () => {
    h.post.mockResolvedValue({ data: { id: '1' } })
    const file = new File(['x'], 'a.png', { type: 'image/png' })
    await userApi.uploadAvatar(file)
    expect(h.post).toHaveBeenCalledWith('/users/me/avatar', expect.any(FormData))
    const fd = h.post.mock.calls[0]![1] as FormData
    expect(fd.get('file')).toBe(file)
  })

  it('deleteAvatar', async () => {
    h.delete.mockResolvedValue({ data: { id: '1' } })
    await userApi.deleteAvatar()
    expect(h.delete).toHaveBeenCalledWith('/users/me/avatar')
  })

  it('exportMyData', async () => {
    h.get.mockResolvedValue({ data: { exportedAt: 'x' } })
    await expect(userApi.exportMyData()).resolves.toEqual({ exportedAt: 'x' })
    expect(h.get).toHaveBeenCalledWith('/users/me/export')
  })
})
