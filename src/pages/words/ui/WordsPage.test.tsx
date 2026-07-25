import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useBandStore } from '@entities/band'
import { useMasteryStore } from '@entities/mastery'
import { useWordStore } from '@entities/word'
import { makeBand, makeWordCard, makeWordLeaf } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { WordsPage } from './WordsPage'

afterEach(() => {
  useBandStore.getState().reset()
  useMasteryStore.getState().reset()
  useWordStore.getState().resetList()
  useWordStore.getState().clearCard()
})

describe('<WordsPage>', () => {
  it('грузит блоки и мой прогресс', () => {
    const fetchBands = vi.fn()
    const fetchMine = vi.fn()
    useBandStore.setState({ fetchBands })
    useWordStore.setState({ selectBand: vi.fn(), loadMore: vi.fn() })
    useMasteryStore.setState({ fetchMine })

    renderWithProviders(<WordsPage />)

    expect(screen.getByText('Слова')).toBeInTheDocument()
    expect(fetchBands).toHaveBeenCalled()
    expect(fetchMine).toHaveBeenCalled()
  })

  it('ошибка блоков → «Повторить» перезагружает', async () => {
    const fetchBands = vi.fn()
    useBandStore.setState({
      fetchBands,
      bands: [],
      status: 'error',
      error: { status: 500, code: 'x', message: 'm' },
    })
    useWordStore.setState({ selectBand: vi.fn(), loadMore: vi.fn() })
    useMasteryStore.setState({ fetchMine: vi.fn() })

    renderWithProviders(<WordsPage />)
    fetchBands.mockClear()
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(fetchBands).toHaveBeenCalled()
  })

  it('ошибка слов → «Повторить» перезагружает блок', async () => {
    const selectBand = vi.fn()
    useBandStore.setState({ fetchBands: vi.fn(), bands: [makeBand()], status: 'success' })
    useWordStore.setState({
      selectBand,
      loadMore: vi.fn(),
      band: 'top-100',
      words: [],
      total: 0,
      listStatus: 'error',
      listError: { status: 500, code: 'x', message: 'm' },
    })
    useMasteryStore.setState({ fetchMine: vi.fn() })

    renderWithProviders(<WordsPage />)
    selectBand.mockClear()
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(selectBand).toHaveBeenCalledWith('top-100')
  })

  it('первый блок раскрывается сам', () => {
    const selectBand = vi.fn()
    useBandStore.setState({ fetchBands: vi.fn(), bands: [makeBand()], status: 'success' })
    useWordStore.setState({ selectBand, loadMore: vi.fn(), band: null })
    useMasteryStore.setState({ fetchMine: vi.fn() })

    renderWithProviders(<WordsPage />)

    expect(selectBand).toHaveBeenCalledWith('top-100')
  })

  it('показывает слова блока, сгруппированные по темам', () => {
    useBandStore.setState({ fetchBands: vi.fn(), bands: [makeBand()], status: 'success' })
    useWordStore.setState({
      selectBand: vi.fn(),
      loadMore: vi.fn(),
      band: 'top-100',
      words: [makeWordLeaf()],
      total: 1,
      listStatus: 'success',
    })
    useMasteryStore.setState({ fetchMine: vi.fn() })

    renderWithProviders(<WordsPage />)

    expect(screen.getByText('go')).toBeInTheDocument()
    expect(screen.getByText('Путешествия')).toBeInTheDocument()
  })

  it('клик по другому блоку выбирает его', async () => {
    const selectBand = vi.fn()
    useBandStore.setState({
      fetchBands: vi.fn(),
      bands: [
        makeBand(),
        makeBand({ id: 'top-500', label: 'Блок 500', fromRank: 101, toRank: 500 }),
      ],
      status: 'success',
    })
    useWordStore.setState({
      selectBand,
      loadMore: vi.fn(),
      band: 'top-100',
      words: [],
      total: 0,
      listStatus: 'success',
    })
    useMasteryStore.setState({ fetchMine: vi.fn() })

    renderWithProviders(<WordsPage />)
    selectBand.mockClear()

    await userEvent.click(screen.getByText('Блок 500'))
    expect(selectBand).toHaveBeenCalledWith('top-500')
  })

  it('«Показать ещё» догружает страницу', async () => {
    const loadMore = vi.fn()
    useBandStore.setState({ fetchBands: vi.fn(), bands: [makeBand()], status: 'success' })
    useWordStore.setState({
      selectBand: vi.fn(),
      loadMore,
      band: 'top-100',
      words: [makeWordLeaf()],
      total: 5,
      listStatus: 'success',
    })
    useMasteryStore.setState({ fetchMine: vi.fn() })

    renderWithProviders(<WordsPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Показать ещё' }))
    expect(loadMore).toHaveBeenCalled()
  })

  it('клик по слову открывает и закрывает карточку', async () => {
    useBandStore.setState({ fetchBands: vi.fn(), bands: [makeBand()], status: 'success' })
    useWordStore.setState({
      selectBand: vi.fn(),
      loadMore: vi.fn(),
      band: 'top-100',
      words: [makeWordLeaf()],
      total: 1,
      listStatus: 'success',
      card: makeWordCard(),
      cardStatus: 'success',
      fetchCard: vi.fn(),
      clearCard: vi.fn(),
    })
    useMasteryStore.setState({ fetchMine: vi.fn() })

    renderWithProviders(<WordsPage />)

    await userEvent.click(screen.getByText('go'))
    expect(await screen.findByText('Мой статус')).toBeInTheDocument()

    await userEvent.click(document.querySelector('.ant-modal-close') as HTMLElement)
    await waitFor(() => expect(screen.queryByText('Мой статус')).not.toBeInTheDocument())
  })
})
