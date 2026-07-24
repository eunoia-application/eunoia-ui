import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MASTERY_META, useMasteryStore } from '@entities/mastery'
import { makeWordLeaf } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { WordList } from './WordList'

const base = {
  words: [],
  total: 0,
  status: 'idle' as const,
  error: null,
  onOpen: vi.fn(),
  onLoadMore: vi.fn(),
  onRetry: vi.fn(),
}

afterEach(() => useMasteryStore.getState().reset())

describe('<WordList>', () => {
  it('loading без слов → скелет', () => {
    const { container } = renderWithProviders(<WordList {...base} status="loading" />)
    expect(container.querySelector('.ant-skeleton')).toBeTruthy()
  })

  it('error без слов → retry', async () => {
    const onRetry = vi.fn()
    renderWithProviders(
      <WordList
        {...base}
        status="error"
        error={{ status: 500, code: 'x', message: 'm' }}
        onRetry={onRetry}
      />,
    )
    expect(screen.getByText('Не удалось загрузить слова')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(onRetry).toHaveBeenCalled()
  })

  it('success без слов → empty-state', () => {
    renderWithProviders(<WordList {...base} status="success" />)
    expect(screen.getByText('В блоке пока нет слов')).toBeInTheDocument()
  })

  it('слова по темам + легенда, клик открывает', async () => {
    const onOpen = vi.fn()
    renderWithProviders(
      <WordList
        {...base}
        status="success"
        words={[makeWordLeaf()]}
        total={1}
        onOpen={onOpen}
      />,
    )
    expect(screen.getByText('Путешествия')).toBeInTheDocument()
    expect(screen.getByText('go')).toBeInTheDocument()
    expect(screen.getByText('Знаю')).toBeInTheDocument()

    await userEvent.click(screen.getByText('go'))
    expect(onOpen).toHaveBeenCalledWith('en:go')
  })

  it('слова-сироты в группе «Разное»', () => {
    renderWithProviders(
      <WordList
        {...base}
        status="success"
        words={[makeWordLeaf({ topics: [], pos: undefined })]}
        total={1}
      />,
    )
    expect(screen.getByText('Разное')).toBeInTheDocument()
  })

  it('«Показать ещё» при незагруженных страницах', async () => {
    const onLoadMore = vi.fn()
    renderWithProviders(
      <WordList
        {...base}
        status="success"
        words={[makeWordLeaf()]}
        total={5}
        onLoadMore={onLoadMore}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Показать ещё' }))
    expect(onLoadMore).toHaveBeenCalled()
  })

  it('локальная отметка перекрашивает слово', () => {
    useMasteryStore.setState({ byId: { 'en:go': 'KNOWN' } })
    renderWithProviders(
      <WordList
        {...base}
        status="success"
        words={[makeWordLeaf({ status: 'UNKNOWN' })]}
        total={1}
      />,
    )
    const chip = screen.getByText('go').closest('button')
    expect(chip?.querySelector('svg')?.getAttribute('stroke')).toBe(MASTERY_META.KNOWN.color)
  })
})
