import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { useUserStore } from '@entities/user'
import { makeProfile, makeSettings } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { SettingsForm } from './SettingsForm'

describe('<SettingsForm>', () => {
  it('сабмит зовёт updateSettings со всеми полями', async () => {
    const updateSettings = vi.fn().mockResolvedValue(undefined)
    useUserStore.setState({
      profile: makeProfile({ settings: makeSettings({ theme: 'DARK' }) }),
      updateSettings,
    })
    renderWithProviders(<SettingsForm />)
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить настройки' }))
    await waitFor(() => expect(updateSettings).toHaveBeenCalled())
    expect(updateSettings.mock.calls[0]![0]).toMatchObject({
      theme: expect.any(String),
      profileVisibility: expect.any(String),
      emailNotifications: expect.any(Boolean),
    })
  })

  it('ошибка не роняет форму', async () => {
    const updateSettings = vi.fn().mockRejectedValue(new Error('x'))
    useUserStore.setState({ profile: makeProfile(), updateSettings })
    renderWithProviders(<SettingsForm />)
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить настройки' }))
    await waitFor(() => expect(updateSettings).toHaveBeenCalled())
  })
})
