import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useSessionStore } from '@entities/session'
import { makeAuthUser } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { HomePage } from './HomePage'

describe('<HomePage>', () => {
  it('приветствие с именем и empty-state сада', () => {
    useSessionStore.setState({ user: makeAuthUser({ username: 'boris' }) })
    renderWithProviders(<HomePage />)
    expect(screen.getByText(/Здравствуйте/)).toBeInTheDocument()
    expect(screen.getByText('Сад пока пуст')).toBeInTheDocument()
  })
})
