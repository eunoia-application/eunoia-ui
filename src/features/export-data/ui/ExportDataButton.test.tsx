import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { userApi } from '@entities/user'
import { makeProfile } from '@shared/test/factories'

import { ExportDataButton } from './ExportDataButton'

afterEach(() => vi.restoreAllMocks())

describe('<ExportDataButton>', () => {
  it('успешный экспорт скачивает JSON', async () => {
    vi.spyOn(userApi, 'exportMyData').mockResolvedValue({
      exportedAt: '2026-06-01T00:00:00Z',
      profile: makeProfile(),
    })
    // jsdom не реализует URL.createObjectURL — подставляем моки.
    const createUrl = vi.fn(() => 'blob:x')
    const revoke = vi.fn()
    URL.createObjectURL = createUrl as unknown as typeof URL.createObjectURL
    URL.revokeObjectURL = revoke as unknown as typeof URL.revokeObjectURL
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})

    render(<ExportDataButton />)
    await userEvent.click(screen.getByRole('button', { name: /Скачать/ }))

    expect(userApi.exportMyData).toHaveBeenCalled()
    expect(createUrl).toHaveBeenCalled()
    expect(click).toHaveBeenCalled()
    expect(revoke).toHaveBeenCalled()
  })

  it('ошибка экспорта обрабатывается', async () => {
    vi.spyOn(userApi, 'exportMyData').mockRejectedValue({
      status: 500,
      code: 'x',
      message: 'нет',
    })
    render(<ExportDataButton />)
    await userEvent.click(screen.getByRole('button', { name: /Скачать/ }))
    expect(userApi.exportMyData).toHaveBeenCalled()
  })
})
