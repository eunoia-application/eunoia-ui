import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useUserStore } from '@entities/user'
import { makeProfile } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { AppLayout } from './AppLayout'

afterEach(() => useUserStore.getState().reset())

describe('<AppLayout>', () => {
  it('рендерит оболочку и грузит профиль, если его нет', () => {
    const fetchProfile = vi.fn()
    useUserStore.setState({ profile: null, fetchProfile })
    renderWithProviders(<AppLayout />)
    expect(fetchProfile).toHaveBeenCalled()
    expect(screen.getByText('Eunoia')).toBeInTheDocument()
  })

  it('не грузит профиль, если он уже есть', () => {
    const fetchProfile = vi.fn()
    useUserStore.setState({ profile: makeProfile(), fetchProfile })
    renderWithProviders(<AppLayout />)
    expect(fetchProfile).not.toHaveBeenCalled()
  })
})
