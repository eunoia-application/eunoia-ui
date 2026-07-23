import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { useUserStore } from '@entities/user'
import { makeProfile } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { ProfileForm } from './ProfileForm'

describe('<ProfileForm>', () => {
  it('заполняет значения из профиля и сабмитит', async () => {
    const updateProfile = vi.fn().mockResolvedValue(undefined)
    useUserStore.setState({ profile: makeProfile({ firstName: 'Alex' }), updateProfile })
    renderWithProviders(<ProfileForm />)
    expect(screen.getByDisplayValue('Alex')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }))
    await waitFor(() => expect(updateProfile).toHaveBeenCalled())
  })

  it('невалидное имя → updateProfile не зовётся', async () => {
    const updateProfile = vi.fn()
    useUserStore.setState({ profile: makeProfile(), updateProfile })
    renderWithProviders(<ProfileForm />)
    fireEvent.change(screen.getByPlaceholderText('Имя'), {
      target: { value: 'x'.repeat(61) },
    })
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }))
    await waitFor(() => expect(screen.getByText('До 60 символов')).toBeInTheDocument())
    expect(updateProfile).not.toHaveBeenCalled()
  })

  it('ошибка сохранения не роняет форму', async () => {
    const updateProfile = vi.fn().mockRejectedValue(new Error('x'))
    useUserStore.setState({ profile: makeProfile(), updateProfile })
    renderWithProviders(<ProfileForm />)
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }))
    await waitFor(() => expect(updateProfile).toHaveBeenCalled())
  })
})
