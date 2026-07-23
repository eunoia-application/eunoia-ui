import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { useUserStore } from '@entities/user'
import { makeProfile } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { AvatarManager } from './AvatarManager'

// Кроп-модалку мокаем: она рендерит canvas/react-easy-crop (недоступно в jsdom).
// Мок отдаёт готовый файл по клику, чтобы проверить путь загрузки.
vi.mock('./AvatarCropModal', () => ({
  AvatarCropModal: ({
    open,
    onCropped,
    onCancel,
  }: {
    open: boolean
    onCropped: (f: File) => void
    onCancel: () => void
  }) =>
    open ? (
      <div role="dialog">
        <button onClick={() => onCropped(new File(['x'], 'cropped.png', { type: 'image/png' }))}>
          CROP_OK
        </button>
        <button onClick={onCancel}>CROP_CANCEL</button>
      </div>
    ) : null,
}))

function fileInput(container: HTMLElement): HTMLElement {
  return container.querySelector('input[type="file"]') as HTMLElement
}

const png = () => new File(['x'], 'a.png', { type: 'image/png' })

describe('<AvatarManager>', () => {
  it('валидный файл → кроп-модалка → загрузка', async () => {
    const uploadAvatar = vi.fn().mockResolvedValue(undefined)
    useUserStore.setState({ profile: makeProfile({ avatarUrl: null }), uploadAvatar })
    const { container } = renderWithProviders(<AvatarManager />)
    await userEvent.upload(fileInput(container), png())
    await screen.findByRole('dialog')
    await userEvent.click(screen.getByText('CROP_OK'))
    await waitFor(() => expect(uploadAvatar).toHaveBeenCalled())
  })

  it('неверный формат — модалку не открывает', async () => {
    const uploadAvatar = vi.fn()
    useUserStore.setState({ profile: makeProfile(), uploadAvatar })
    const { container } = renderWithProviders(<AvatarManager />)
    await userEvent.upload(fileInput(container), new File(['x'], 'a.txt', { type: 'text/plain' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(uploadAvatar).not.toHaveBeenCalled()
  })

  it('слишком большой файл — не открывает', async () => {
    const uploadAvatar = vi.fn()
    useUserStore.setState({ profile: makeProfile(), uploadAvatar })
    const { container } = renderWithProviders(<AvatarManager />)
    await userEvent.upload(
      fileInput(container),
      new File([new Uint8Array(6 * 1024 * 1024)], 'a.png', { type: 'image/png' }),
    )
    expect(uploadAvatar).not.toHaveBeenCalled()
  })

  it('ошибка загрузки не роняет', async () => {
    const uploadAvatar = vi.fn().mockRejectedValue(new Error('x'))
    useUserStore.setState({ profile: makeProfile({ avatarUrl: null }), uploadAvatar })
    const { container } = renderWithProviders(<AvatarManager />)
    await userEvent.upload(fileInput(container), png())
    await screen.findByRole('dialog')
    await userEvent.click(screen.getByText('CROP_OK'))
    await waitFor(() => expect(uploadAvatar).toHaveBeenCalled())
  })

  it('отмена кропа закрывает модалку', async () => {
    useUserStore.setState({ profile: makeProfile(), uploadAvatar: vi.fn() })
    const { container } = renderWithProviders(<AvatarManager />)
    await userEvent.upload(fileInput(container), png())
    await screen.findByRole('dialog')
    await userEvent.click(screen.getByText('CROP_CANCEL'))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('удаление аватара', async () => {
    const deleteAvatar = vi.fn().mockResolvedValue(undefined)
    useUserStore.setState({ profile: makeProfile({ avatarUrl: 'http://x/a.png' }), deleteAvatar })
    renderWithProviders(<AvatarManager />)
    await userEvent.click(screen.getByRole('button', { name: /Удалить/ }))
    await waitFor(() => expect(deleteAvatar).toHaveBeenCalled())
  })

  it('ошибка удаления не роняет', async () => {
    const deleteAvatar = vi.fn().mockRejectedValue(new Error('x'))
    useUserStore.setState({ profile: makeProfile({ avatarUrl: 'http://x/a.png' }), deleteAvatar })
    renderWithProviders(<AvatarManager />)
    await userEvent.click(screen.getByRole('button', { name: /Удалить/ }))
    await waitFor(() => expect(deleteAvatar).toHaveBeenCalled())
  })
})
