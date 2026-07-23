import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useSessionStore } from '@entities/session'
import { useUserStore } from '@entities/user'
import { makeAuthUser, makeProfile } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { AppTopbar } from './AppTopbar'

afterEach(() => useUserStore.getState().reset())

describe('<AppTopbar>', () => {
  it('показывает имя из полного профиля', () => {
    useUserStore.setState({ profile: makeProfile({ firstName: 'Alex', lastName: 'Johnson' }) })
    renderWithProviders(<AppTopbar />)
    expect(screen.getByText('Alex Johnson')).toBeInTheDocument()
  })

  it('фоллбэк на сессию, если профиля нет', () => {
    useUserStore.setState({ profile: null })
    useSessionStore.setState({ user: makeAuthUser({ username: 'boris' }) })
    renderWithProviders(<AppTopbar />)
    expect(screen.getByText('boris')).toBeInTheDocument()
  })

  it('меню пользователя → выход', async () => {
    useUserStore.setState({ profile: makeProfile({ firstName: 'Alex', lastName: 'Johnson' }), reset: vi.fn() })
    const logout = vi.fn().mockResolvedValue(undefined)
    useSessionStore.setState({ logout })
    renderWithProviders(<AppTopbar />)
    await userEvent.click(screen.getByText('Alex Johnson'))
    await userEvent.click(await screen.findByText('Выйти'))
    await waitFor(() => expect(logout).toHaveBeenCalled())
  })
})
