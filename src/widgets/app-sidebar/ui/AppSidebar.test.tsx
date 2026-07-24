import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useSessionStore } from '@entities/session'
import { useUserStore } from '@entities/user'
import { APP } from '@shared/config'
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

  it('меню профиля — премиум-шапка с email', async () => {
    withUser()
    renderWithProviders(<AppSidebar collapsed={false} onCollapse={vi.fn()} />)
    await userEvent.click(screen.getByText('Alex Johnson'))
    await screen.findByText('Настройки')
    // email виден и в карточке сайдбара, и в шапке открытого меню
    expect(screen.getAllByText('user@example.com').length).toBeGreaterThanOrEqual(2)
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

  it('карточка пользователя показывает email', () => {
    withUser()
    renderWithProviders(<AppSidebar collapsed={false} onCollapse={vi.fn()} />)
    expect(screen.getByText('user@example.com')).toBeInTheDocument()
  })

  it('футер: версия и сворачивание', async () => {
    const onCollapse = vi.fn()
    renderWithProviders(<AppSidebar collapsed={false} onCollapse={onCollapse} />)
    expect(screen.getByText(`v${APP.version}`)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Свернуть меню' }))
    expect(onCollapse).toHaveBeenCalledWith(true)
  })

  it('collapsed: кнопка разворачивает меню', async () => {
    const onCollapse = vi.fn()
    renderWithProviders(<AppSidebar collapsed onCollapse={onCollapse} />)
    await userEvent.click(screen.getByRole('button', { name: 'Развернуть меню' }))
    expect(onCollapse).toHaveBeenCalledWith(false)
  })
})
