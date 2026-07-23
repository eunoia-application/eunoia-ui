import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@shared/test/render'

import { AuthCardMobile } from './AuthCardMobile'

describe('<AuthCardMobile>', () => {
  it('signIn: заголовок входа, таб переключает', async () => {
    const onSwitch = vi.fn()
    renderWithProviders(<AuthCardMobile mode="signIn" onSwitch={onSwitch} />)
    expect(screen.getByText('Вход в цифровой сад')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Регистрация'))
    expect(onSwitch).toHaveBeenCalledWith('signUp')
  })

  it('signUp: заголовок регистрации', () => {
    renderWithProviders(<AuthCardMobile mode="signUp" onSwitch={vi.fn()} />)
    expect(screen.getByText('Создать сад')).toBeInTheDocument()
  })
})
