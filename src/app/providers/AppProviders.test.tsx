import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useSessionStore } from '@entities/session'

import { AppProviders } from './AppProviders'

describe('<AppProviders>', () => {
  it('без сессии показывает страницу входа', async () => {
    useSessionStore.setState({ accessToken: null })
    render(<AppProviders />)
    await waitFor(() =>
      expect(screen.getByText('Вход в цифровой сад')).toBeInTheDocument(),
    )
  })
})
