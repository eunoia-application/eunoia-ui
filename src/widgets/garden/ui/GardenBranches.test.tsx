import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { makeTopicRef } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { GardenBranches } from './GardenBranches'

const base = {
  roots: [],
  status: 'idle' as const,
  error: null,
  activeId: null,
  onSelect: vi.fn(),
  onRetry: vi.fn(),
}

describe('<GardenBranches>', () => {
  it('loading без данных → скелет', () => {
    const { container } = renderWithProviders(
      <GardenBranches {...base} status="loading" />,
    )
    expect(container.querySelector('.ant-skeleton')).toBeTruthy()
  })

  it('error без данных → retry', async () => {
    const onRetry = vi.fn()
    renderWithProviders(
      <GardenBranches
        {...base}
        status="error"
        error={{ status: 500, code: 'x', message: 'm' }}
        onRetry={onRetry}
      />,
    )
    expect(screen.getByText('Не удалось загрузить ветки')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(onRetry).toHaveBeenCalled()
  })

  it('success без веток → empty-state', () => {
    renderWithProviders(<GardenBranches {...base} status="success" />)
    expect(screen.getByText('Веток пока нет')).toBeInTheDocument()
  })

  it('ветки рисуются, клик выбирает', async () => {
    const onSelect = vi.fn()
    renderWithProviders(
      <GardenBranches
        {...base}
        status="success"
        roots={[makeTopicRef(), makeTopicRef({ id: 't-food', name: 'Еда' })]}
        activeId="t-travel"
        onSelect={onSelect}
      />,
    )
    expect(screen.getByRole('button', { name: /Путешествия/ })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Еда/ }))
    expect(onSelect).toHaveBeenCalledWith('t-food')
  })
})
