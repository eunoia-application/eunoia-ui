import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ErrorRetry } from './ErrorRetry'

describe('<ErrorRetry>', () => {
  it('дефолтный заголовок + сообщение из error', () => {
    render(<ErrorRetry error={{ status: 500, code: 'x', message: 'сломалось' }} />)
    expect(screen.getByText('Не удалось загрузить')).toBeInTheDocument()
    expect(screen.getByText('сломалось')).toBeInTheDocument()
  })

  it('кастомный title', () => {
    render(<ErrorRetry title="Ошибка сети" />)
    expect(screen.getByText('Ошибка сети')).toBeInTheDocument()
  })

  it('retry-кнопка зовёт onRetry', async () => {
    const onRetry = vi.fn()
    render(<ErrorRetry onRetry={onRetry} />)
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('без onRetry кнопки нет', () => {
    render(<ErrorRetry />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('маппинг статусов 403/404/500/прочее не падает', () => {
    for (const status of [403, 404, 500, 418]) {
      const { unmount } = render(
        <ErrorRetry error={{ status, code: '', message: '' }} />,
      )
      expect(screen.getByText('Не удалось загрузить')).toBeInTheDocument()
      unmount()
    }
  })
})
