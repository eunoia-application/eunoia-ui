import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { useSessionStore } from '@entities/session'
import { useUserStore } from '@entities/user'
import { renderWithProviders } from '@shared/test/render'

import { DeleteAccountButton } from './DeleteAccountButton'

async function confirmDelete() {
  await userEvent.click(screen.getByRole('button', { name: 'Удалить аккаунт' }))
  const buttons = await screen.findAllByRole('button', { name: 'Удалить аккаунт' })
  await userEvent.click(buttons[buttons.length - 1]!)
}

describe('<DeleteAccountButton>', () => {
  it('подтверждение → deleteAccount + reset', async () => {
    const deleteAccount = vi.fn().mockResolvedValue(undefined)
    const reset = vi.fn()
    useSessionStore.setState({ deleteAccount })
    useUserStore.setState({ reset })
    renderWithProviders(<DeleteAccountButton />)
    await confirmDelete()
    await waitFor(() => expect(deleteAccount).toHaveBeenCalled())
    expect(reset).toHaveBeenCalled()
  })

  it('ошибка удаления (ApiError) обрабатывается', async () => {
    const deleteAccount = vi.fn().mockRejectedValue({ status: 500, code: 'x', message: 'нет' })
    useSessionStore.setState({ deleteAccount })
    useUserStore.setState({ reset: vi.fn() })
    renderWithProviders(<DeleteAccountButton />)
    await confirmDelete()
    await waitFor(() => expect(deleteAccount).toHaveBeenCalled())
  })

  it('ошибка удаления (обычная) обрабатывается', async () => {
    const deleteAccount = vi.fn().mockRejectedValue(new Error('boom'))
    useSessionStore.setState({ deleteAccount })
    useUserStore.setState({ reset: vi.fn() })
    renderWithProviders(<DeleteAccountButton />)
    await confirmDelete()
    await waitFor(() => expect(deleteAccount).toHaveBeenCalled())
  })
})
