import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { makeBand } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { ProgressHero } from './ProgressHero'

describe('<ProgressHero>', () => {
  it('loading без блоков → скелет', () => {
    const { container } = renderWithProviders(<ProgressHero bands={[]} status="loading" />)
    expect(container.querySelector('.ant-skeleton')).toBeTruthy()
  })

  it('success без блоков → ничего не рисует', () => {
    const { container } = renderWithProviders(<ProgressHero bands={[]} status="success" />)
    expect(container.querySelector('.ant-card')).toBeNull()
  })

  it('суммирует прогресс по всем блокам', () => {
    renderWithProviders(
      <ProgressHero
        status="success"
        bands={[
          makeBand({ known: 10, learning: 5, total: 100 }),
          makeBand({ id: 'b2', known: 20, learning: 10, total: 100 }),
        ]}
      />,
    )
    expect(screen.getByText('Ваш словарный сад')).toBeInTheDocument()
    // known 30 / total 200 → 15 %
    expect(screen.getByText('15%')).toBeInTheDocument()
    expect(screen.getByText('Знаю')).toBeInTheDocument()
    expect(screen.getByText('Учить')).toBeInTheDocument()
    expect(screen.getByText('Осталось')).toBeInTheDocument()
    expect(screen.getAllByText('30').length).toBeGreaterThanOrEqual(1)
  })

  it('нулевой словарь → 0 %', () => {
    renderWithProviders(
      <ProgressHero status="success" bands={[makeBand({ known: 0, learning: 0, total: 0 })]} />,
    )
    expect(screen.getByText('0%')).toBeInTheDocument()
  })
})
