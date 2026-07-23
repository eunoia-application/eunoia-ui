import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { useUserStore } from '@entities/user'
import { makeProfile } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { AvatarManager } from './AvatarManager'

function fileInput(container: HTMLElement): HTMLElement {
  return container.querySelector('input[type="file"]') as HTMLElement
}

describe('<AvatarManager>', () => {
  it('валидный файл → uploadAvatar', async () => {
    const uploadAvatar = vi.fn().mockResolvedValue(undefined)
    useUserStore.setState({ profile: makeProfile({ avatarUrl: null }), uploadAvatar })
    const { container } = renderWithProviders(<AvatarManager />)
    const file = new File(['x'], 'a.png', { type: 'image/png' })
    await userEvent.upload(fileInput(container), file)
    await waitFor(() => expect(uploadAvatar).toHaveBeenCalledWith(file))
  })

  it('неверный формат → не грузит', async () => {
    const uploadAvatar = vi.fn()
    useUserStore.setState({ profile: makeProfile(), uploadAvatar })
    const { container } = renderWithProviders(<AvatarManager />)
    await userEvent.upload(fileInput(container), new File(['x'], 'a.txt', { type: 'text/plain' }))
    expect(uploadAvatar).not.toHaveBeenCalled()
  })

  it('слишком большой файл → не грузит', async () => {
    const uploadAvatar = vi.fn()
    useUserStore.setState({ profile: makeProfile(), uploadAvatar })
    const { container } = renderWithProviders(<AvatarManager />)
    const big = new File([new Uint8Array(6 * 1024 * 1024)], 'a.png', { type: 'image/png' })
    await userEvent.upload(fileInput(container), big)
    expect(uploadAvatar).not.toHaveBeenCalled()
  })

  it('ошибка загрузки не роняет', async () => {
    const uploadAvatar = vi.fn().mockRejectedValue(new Error('x'))
    useUserStore.setState({ profile: makeProfile(), uploadAvatar })
    const { container } = renderWithProviders(<AvatarManager />)
    await userEvent.upload(fileInput(container), new File(['x'], 'a.png', { type: 'image/png' }))
    await waitFor(() => expect(uploadAvatar).toHaveBeenCalled())
  })

  it('удаление аватара', async () => {
    const deleteAvatar = vi.fn().mockResolvedValue(undefined)
    useUserStore.setState({
      profile: makeProfile({ avatarUrl: 'http://x/a.png' }),
      deleteAvatar,
    })
    renderWithProviders(<AvatarManager />)
    await userEvent.click(screen.getByRole('button', { name: /Удалить/ }))
    await waitFor(() => expect(deleteAvatar).toHaveBeenCalled())
  })

  it('ошибка удаления не роняет', async () => {
    const deleteAvatar = vi.fn().mockRejectedValue(new Error('x'))
    useUserStore.setState({
      profile: makeProfile({ avatarUrl: 'http://x/a.png' }),
      deleteAvatar,
    })
    renderWithProviders(<AvatarManager />)
    await userEvent.click(screen.getByRole('button', { name: /Удалить/ }))
    await waitFor(() => expect(deleteAvatar).toHaveBeenCalled())
  })
})
