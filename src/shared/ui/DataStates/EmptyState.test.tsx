import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { EmptyState } from './EmptyState'

describe('<EmptyState>', () => {
  it('дефолтный заголовок «Пока пусто»', () => {
    render(<EmptyState />)
    expect(screen.getByText('Пока пусто')).toBeInTheDocument()
  })

  it('кастомные title и description', () => {
    render(<EmptyState title="Нет заметок" description="Создайте первую" />)
    expect(screen.getByText('Нет заметок')).toBeInTheDocument()
    expect(screen.getByText('Создайте первую')).toBeInTheDocument()
  })

  it('action рендерит кнопку и зовёт onClick', async () => {
    const onClick = vi.fn()
    render(<EmptyState action={{ label: 'Повторить', onClick }} />)
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('без action кнопки нет', () => {
    render(<EmptyState />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('кастомная иконка заменяет дефолтную', () => {
    render(<EmptyState icon={<span data-testid="custom-icon" />} />)
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })
})
