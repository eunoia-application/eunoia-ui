import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { makeBand } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { BandList } from './BandList'

const base = {
  bands: [],
  status: 'idle' as const,
  error: null,
  activeId: null,
  onSelect: vi.fn(),
  onRetry: vi.fn(),
}

describe('<BandList>', () => {
  it('loading без данных → скелет', () => {
    const { container } = renderWithProviders(<BandList {...base} status="loading" />)
    expect(container.querySelector('.ant-skeleton')).toBeTruthy()
  })

  it('error без данных → retry', async () => {
    const onRetry = vi.fn()
    renderWithProviders(
      <BandList
        {...base}
        status="error"
        error={{ status: 500, code: 'x', message: 'm' }}
        onRetry={onRetry}
      />,
    )
    expect(screen.getByText('Не удалось загрузить блоки')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(onRetry).toHaveBeenCalled()
  })

  it('success без блоков → empty-state', () => {
    renderWithProviders(<BandList {...base} status="success" />)
    expect(screen.getByText('Блоков пока нет')).toBeInTheDocument()
  })

  it('блоки с прогрессом, клик выбирает', async () => {
    const onSelect = vi.fn()
    renderWithProviders(
      <BandList
        {...base}
        status="success"
        bands={[
          makeBand(),
          makeBand({
            id: 'top-500',
            label: 'Блок 500',
            fromRank: 101,
            toRank: 500,
            known: 0,
            learning: 0,
            total: 400,
          }),
          makeBand({ id: 'empty', label: 'Пустой', total: 0, known: 0, learning: 0 }),
        ]}
        activeId="top-100"
        onSelect={onSelect}
      />,
    )
    expect(screen.getByText('Топ-100')).toBeInTheDocument()
    expect(screen.getByText('10 знаю · 5 учить · 100 слов')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Блок 500'))
    expect(onSelect).toHaveBeenCalledWith('top-500')
  })
})
