import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useSessionStore } from '@entities/session'
import { useUserStore } from '@entities/user'
import { makeAuthUser, makeProfile } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { AppSidebar } from './AppSidebar'

afterEach(() => useUserStore.getState().reset())

function withUser(name = 'Alex Johnson') {
  const [firstName, lastName] = name.split(' ')
  useUserStore.setState({ profile: makeProfile({ firstName, lastName }), reset: vi.fn() })
}

describe('<AppSidebar>', () => {
  it('лого, навигация «Сад» и имя пользователя', () => {
    withUser()
    renderWithProviders(<AppSidebar collapsed={false} onCollapse={vi.fn()} />)
    expect(screen.getByText('Eunoia')).toBeInTheDocument()
    expect(screen.getByText('Сад')).toBeInTheDocument()
    expect(screen.getByText('Alex Johnson')).toBeInTheDocument()
  })

  it('фоллбэк имени на сессию', () => {
    useUserStore.setState({ profile: null })
    useSessionStore.setState({ user: makeAuthUser({ username: 'boris' }) })
    renderWithProviders(<AppSidebar collapsed={false} onCollapse={vi.fn()} />)
    expect(screen.getByText('boris')).toBeInTheDocument()
  })

  it('клик по «Сад» не падает', async () => {
    renderWithProviders(<AppSidebar collapsed={false} onCollapse={vi.fn()} />)
    await userEvent.click(screen.getByText('Сад'))
  })

  it('на /settings пункт «Сад» неактивен, но отрисован', () => {
    withUser()
    renderWithProviders(<AppSidebar collapsed={false} onCollapse={vi.fn()} />, {
      route: '/settings',
    })
    expect(screen.getByText('Сад')).toBeInTheDocument()
  })

  it('клик по пользователю открывает меню «Настройки» + «Выйти»', async () => {
    withUser()
    renderWithProviders(<AppSidebar collapsed={false} onCollapse={vi.fn()} />)
    await userEvent.click(screen.getByText('Alex Johnson'))
    expect(await screen.findByText('Настройки')).toBeInTheDocument()
    expect(screen.getByText('Выйти')).toBeInTheDocument()
  })

  it('«Настройки» из меню пользователя не падает', async () => {
    withUser()
    renderWithProviders(<AppSidebar collapsed={false} onCollapse={vi.fn()} />)
    await userEvent.click(screen.getByText('Alex Johnson'))
    await userEvent.click(await screen.findByText('Настройки'))
  })

  it('«Выйти» из меню пользователя', async () => {
    withUser()
    const logout = vi.fn().mockResolvedValue(undefined)
    useSessionStore.setState({ logout })
    renderWithProviders(<AppSidebar collapsed={false} onCollapse={vi.fn()} />)
    await userEvent.click(screen.getByText('Alex Johnson'))
    await userEvent.click(await screen.findByText('Выйти'))
    await waitFor(() => expect(logout).toHaveBeenCalled())
  })

  it('collapsed скрывает текстовые подписи', () => {
    renderWithProviders(<AppSidebar collapsed onCollapse={vi.fn()} />)
    expect(screen.queryByText('Eunoia')).toBeNull()
  })
})
