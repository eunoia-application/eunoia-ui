import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useUserStore } from '@entities/user'
import { makeProfile } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { SettingsPage } from './SettingsPage'

afterEach(() => useUserStore.getState().reset())

describe('<SettingsPage>', () => {
  it('loading → скелет', () => {
    useUserStore.setState({ status: 'loading', profile: null, fetchProfile: vi.fn() })
    renderWithProviders(<SettingsPage />)
    expect(document.querySelector('.ant-skeleton')).toBeTruthy()
  })

  it('error → retry вызывает fetchProfile', async () => {
    const fetchProfile = vi.fn()
    useUserStore.setState({
      status: 'error',
      profile: null,
      error: { status: 500, code: 'x', message: 'm' },
      fetchProfile,
    })
    renderWithProviders(<SettingsPage />)
    expect(screen.getByText('Не удалось загрузить')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    await waitFor(() => expect(fetchProfile).toHaveBeenCalled())
  })

  it('success → секции профиля и опасной зоны', () => {
    useUserStore.setState({ status: 'success', profile: makeProfile(), fetchProfile: vi.fn() })
    renderWithProviders(<SettingsPage />)
    expect(screen.getByText('Профиль')).toBeInTheDocument()
    expect(screen.getByText('Опасная зона')).toBeInTheDocument()
  })

  it('при монтировании без профиля грузит его', () => {
    const fetchProfile = vi.fn()
    useUserStore.setState({ status: 'idle', profile: null, fetchProfile })
    renderWithProviders(<SettingsPage />)
    expect(fetchProfile).toHaveBeenCalled()
  })
})
