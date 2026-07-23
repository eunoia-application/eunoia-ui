import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useSessionStore } from '@entities/session'
import { renderWithProviders } from '@shared/test/render'

import { AppRoutes } from './AppRoutes'

describe('<AppRoutes>', () => {
  it('без сессии на / → страница входа', async () => {
    useSessionStore.setState({ accessToken: null })
    renderWithProviders(<AppRoutes />, { route: '/' })
    await waitFor(() =>
      expect(screen.getByText('Вход в цифровой сад')).toBeInTheDocument(),
    )
  })

  it('неизвестный путь → редирект на вход', async () => {
    useSessionStore.setState({ accessToken: null })
    renderWithProviders(<AppRoutes />, { route: '/does-not-exist' })
    await waitFor(() =>
      expect(screen.getByText('Вход в цифровой сад')).toBeInTheDocument(),
    )
  })
})
