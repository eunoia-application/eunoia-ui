import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { useSessionStore } from '@entities/session'
import { renderWithProviders } from '@shared/test/render'

import { SignInForm } from './SignInForm'

async function fill() {
  await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'a@b.co')
  await userEvent.type(screen.getByPlaceholderText('••••••••'), 'secret1')
}

describe('<SignInForm>', () => {
  it('валидный сабмит зовёт login', async () => {
    const login = vi.fn().mockResolvedValue(undefined)
    useSessionStore.setState({ login })
    renderWithProviders(<SignInForm />)
    await fill()
    await userEvent.click(screen.getByRole('button', { name: 'Войти' }))
    await waitFor(() =>
      expect(login).toHaveBeenCalledWith({ email: 'a@b.co', password: 'secret1' }),
    )
  })

  it('невалидный сабмит не зовёт login', async () => {
    const login = vi.fn()
    useSessionStore.setState({ login })
    renderWithProviders(<SignInForm />)
    await userEvent.click(screen.getByRole('button', { name: 'Войти' }))
    expect(login).not.toHaveBeenCalled()
  })

  it('ошибка сервера (ApiError) обрабатывается', async () => {
    const login = vi.fn().mockRejectedValue({ status: 401, code: 'x', message: 'нет' })
    useSessionStore.setState({ login })
    renderWithProviders(<SignInForm />)
    await fill()
    await userEvent.click(screen.getByRole('button', { name: 'Войти' }))
    await waitFor(() => expect(login).toHaveBeenCalled())
  })

  it('ошибка сервера (обычная) обрабатывается', async () => {
    const login = vi.fn().mockRejectedValue(new Error('boom'))
    useSessionStore.setState({ login })
    renderWithProviders(<SignInForm />)
    await fill()
    await userEvent.click(screen.getByRole('button', { name: 'Войти' }))
    await waitFor(() => expect(login).toHaveBeenCalled())
  })
})
