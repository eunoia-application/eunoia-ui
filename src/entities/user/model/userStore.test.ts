import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useThemeStore } from '@shared/theme'
import { makeProfile, makeSettings } from '@shared/test/factories'

import { userApi } from '../api/userApi'
import { useUserStore } from './userStore'

vi.mock('../api/userApi', () => ({
  userApi: {
    getCurrentUser: vi.fn(),
    updateCurrentUser: vi.fn(),
    updateSettings: vi.fn(),
    uploadAvatar: vi.fn(),
    deleteAvatar: vi.fn(),
  },
}))

const api = userApi as unknown as Record<string, ReturnType<typeof vi.fn>>
const store = () => useUserStore.getState()

beforeEach(() => {
  store().reset()
  Object.values(api).forEach((f) => f.mockReset())
  useThemeStore.setState({ mode: 'system' })
})

describe('userStore', () => {
  it('fetchProfile success + синк темы из настроек', async () => {
    api.getCurrentUser.mockResolvedValue(makeProfile({ settings: makeSettings({ theme: 'DARK' }) }))
    await store().fetchProfile()
    expect(store().status).toBe('success')
    expect(useThemeStore.getState().mode).toBe('dark')
  })

  it('fetchProfile без settings — тему не трогает', async () => {
    api.getCurrentUser.mockResolvedValue(makeProfile({ settings: undefined }))
    await store().fetchProfile()
    expect(useThemeStore.getState().mode).toBe('system')
  })

  it('fetchProfile error (ApiError)', async () => {
    api.getCurrentUser.mockRejectedValue({ status: 500, code: 'x', message: 'm' })
    await store().fetchProfile()
    expect(store().status).toBe('error')
    expect(store().error).toMatchObject({ status: 500 })
  })

  it('fetchProfile error (обычная) → error null', async () => {
    api.getCurrentUser.mockRejectedValue(new Error('x'))
    await store().fetchProfile()
    expect(store().error).toBeNull()
  })

  it('updateProfile оптимистично, затем сервер', async () => {
    useUserStore.setState({ profile: makeProfile({ firstName: 'Old' }) })
    api.updateCurrentUser.mockResolvedValue(makeProfile({ firstName: 'Server' }))
    await store().updateProfile({ firstName: 'New' })
    expect(store().profile?.firstName).toBe('Server')
  })

  it('updateProfile без начального профиля', async () => {
    api.updateCurrentUser.mockResolvedValue(makeProfile({ firstName: 'S' }))
    await store().updateProfile({ firstName: 'X' })
    expect(store().profile?.firstName).toBe('S')
  })

  it('updateProfile error → откат + throw', async () => {
    useUserStore.setState({ profile: makeProfile({ firstName: 'Old' }) })
    api.updateCurrentUser.mockRejectedValue({ status: 400, code: 'x', message: 'нет' })
    await expect(store().updateProfile({ firstName: 'New' })).rejects.toBeDefined()
    expect(store().profile?.firstName).toBe('Old')
  })

  it('updateSettings + синк темы', async () => {
    api.updateSettings.mockResolvedValue(makeProfile({ settings: makeSettings({ theme: 'LIGHT' }) }))
    await store().updateSettings(makeSettings({ theme: 'LIGHT' }))
    expect(useThemeStore.getState().mode).toBe('light')
  })

  it('updateSettings error → throw', async () => {
    api.updateSettings.mockRejectedValue(new Error('x'))
    await expect(store().updateSettings(makeSettings())).rejects.toBeDefined()
  })

  it('uploadAvatar success', async () => {
    api.uploadAvatar.mockResolvedValue(makeProfile({ avatarUrl: 'http://x/a.png' }))
    await store().uploadAvatar(new File(['x'], 'a.png'))
    expect(store().profile?.avatarUrl).toBe('http://x/a.png')
  })

  it('uploadAvatar error → throw', async () => {
    api.uploadAvatar.mockRejectedValue(new Error('x'))
    await expect(store().uploadAvatar(new File(['x'], 'a'))).rejects.toBeDefined()
  })

  it('deleteAvatar success', async () => {
    useUserStore.setState({ profile: makeProfile({ avatarUrl: 'x' }) })
    api.deleteAvatar.mockResolvedValue(makeProfile({ avatarUrl: null }))
    await store().deleteAvatar()
    expect(store().profile?.avatarUrl).toBeNull()
  })

  it('deleteAvatar error → throw', async () => {
    api.deleteAvatar.mockRejectedValue(new Error('x'))
    await expect(store().deleteAvatar()).rejects.toBeDefined()
  })
})
