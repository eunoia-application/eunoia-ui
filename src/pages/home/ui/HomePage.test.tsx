import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type * as RouterDom from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useSessionStore } from '@entities/session'
import { makeAuthUser } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { HomePage } from './HomePage'

const navigate = vi.fn()

vi.mock('react-router-dom', async (orig) => {
  const actual = await orig<typeof RouterDom>()
  return { ...actual, useNavigate: () => navigate }
})

afterEach(() => navigate.mockReset())

describe('<HomePage>', () => {
  it('приветствие с именем и честная заглушка визуализации', () => {
    useSessionStore.setState({ user: makeAuthUser({ username: 'boris' }) })

    renderWithProviders(<HomePage />)

    expect(screen.getByText(/Здравствуйте/)).toBeInTheDocument()
    expect(screen.getByText('Дерево ещё растёт')).toBeInTheDocument()
  })

  it('уводит в раздел слов', async () => {
    useSessionStore.setState({ user: makeAuthUser() })

    renderWithProviders(<HomePage />)
    await userEvent.click(screen.getByRole('button', { name: 'Перейти к словам' }))

    expect(navigate).toHaveBeenCalledWith('/words')
  })
})
