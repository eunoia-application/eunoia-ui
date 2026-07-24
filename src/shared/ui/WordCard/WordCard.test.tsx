import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { makeWordLeaf } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { WordCard } from './WordCard'

describe('<WordCard>', () => {
  it('лемма, подпись и цвет статуса', () => {
    renderWithProviders(
      <WordCard leaf={makeWordLeaf()} color="#2F6F4F" meta="глаг. · A1" onOpen={vi.fn()} />,
    )
    expect(screen.getByText('go')).toBeInTheDocument()
    expect(screen.getByText('глаг. · A1')).toBeInTheDocument()
    expect(screen.getByText('go').closest('button')?.querySelector('svg')?.getAttribute('stroke')).toBe(
      '#2F6F4F',
    )
  })

  it('клик отдаёт id слова', async () => {
    const onOpen = vi.fn()
    renderWithProviders(
      <WordCard leaf={makeWordLeaf()} color="#000" onOpen={onOpen} />,
    )
    await userEvent.click(screen.getByText('go'))
    expect(onOpen).toHaveBeenCalledWith('en:go')
  })

  it('без подписи не падает', () => {
    renderWithProviders(<WordCard leaf={makeWordLeaf()} color="#000" onOpen={vi.fn()} />)
    expect(screen.getByText('go')).toBeInTheDocument()
  })
})
