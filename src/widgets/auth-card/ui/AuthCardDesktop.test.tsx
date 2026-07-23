import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@shared/test/render'

import { AuthCardDesktop } from './AuthCardDesktop'

describe('<AuthCardDesktop>', () => {
  it('signIn: overlay «Нет сада?» + кнопка переключает на регистрацию', async () => {
    const onSwitch = vi.fn()
    renderWithProviders(<AuthCardDesktop mode="signIn" onSwitch={onSwitch} />)
    expect(screen.getByText('Нет сада?')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Создать сад' }))
    expect(onSwitch).toHaveBeenCalledWith('signUp')
  })

  it('signUp: overlay «Уже есть сад?» + кнопка переключает на вход', async () => {
    const onSwitch = vi.fn()
    renderWithProviders(<AuthCardDesktop mode="signUp" onSwitch={onSwitch} />)
    expect(screen.getByText('Уже есть сад?')).toBeInTheDocument()
    const loginButtons = screen.getAllByRole('button', { name: 'Войти' })
    await userEvent.click(loginButtons[loginButtons.length - 1]!)
    expect(onSwitch).toHaveBeenCalledWith('signIn')
  })
})
