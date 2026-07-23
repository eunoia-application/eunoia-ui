import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { useSessionStore } from '@entities/session'
import { renderWithProviders } from '@shared/test/render'

import { SignUpForm } from './SignUpForm'

async function fill() {
  await userEvent.type(screen.getByPlaceholderText('username'), 'eunoia_user')
  await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'a@b.co')
  await userEvent.type(screen.getByPlaceholderText('Минимум 8 символов'), 'password1')
}

describe('<SignUpForm>', () => {
  it('валидный сабмит зовёт register', async () => {
    const register = vi.fn().mockResolvedValue(undefined)
    useSessionStore.setState({ register })
    renderWithProviders(<SignUpForm />)
    await fill()
    await userEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))
    await waitFor(() => expect(register).toHaveBeenCalled())
  })

  it('невалидный сабмит не зовёт register', async () => {
    const register = vi.fn()
    useSessionStore.setState({ register })
    renderWithProviders(<SignUpForm />)
    await userEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))
    expect(register).not.toHaveBeenCalled()
  })

  it('ошибка сервера обрабатывается', async () => {
    const register = vi.fn().mockRejectedValue({ status: 409, code: 'x', message: 'занято' })
    useSessionStore.setState({ register })
    renderWithProviders(<SignUpForm />)
    await fill()
    await userEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))
    await waitFor(() => expect(register).toHaveBeenCalled())
  })

  it('ошибка (обычная) обрабатывается', async () => {
    const register = vi.fn().mockRejectedValue(new Error('boom'))
    useSessionStore.setState({ register })
    renderWithProviders(<SignUpForm />)
    await fill()
    await userEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))
    await waitFor(() => expect(register).toHaveBeenCalled())
  })
})
