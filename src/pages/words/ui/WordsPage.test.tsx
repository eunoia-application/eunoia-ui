import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useLexemeStore } from '@entities/lexeme'
import { useMasteryStore } from '@entities/mastery'
import { useTopicStore } from '@entities/topic'
import {
  makeLexemeCard,
  makeTopicRef,
  makeTopicView,
} from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { WordsPage } from './WordsPage'

afterEach(() => {
  useTopicStore.getState().reset()
  useMasteryStore.getState().reset()
  useLexemeStore.getState().clear()
})

describe('<WordsPage>', () => {
  it('грузит ветки и мой прогресс', () => {
    const fetchRoots = vi.fn()
    const fetchMine = vi.fn()
    useTopicStore.setState({ fetchRoots, fetchView: vi.fn() })
    useMasteryStore.setState({ fetchMine })

    renderWithProviders(<WordsPage />)

    expect(screen.getByText('Слова')).toBeInTheDocument()
    expect(fetchRoots).toHaveBeenCalled()
    expect(fetchMine).toHaveBeenCalled()
  })

  it('считает листья по статусам', () => {
    useTopicStore.setState({ fetchRoots: vi.fn(), fetchView: vi.fn() })
    useMasteryStore.setState({
      fetchMine: vi.fn(),
      status: 'success',
      byId: {
        'en:go:VERB': 'KNOWN',
        'en:run:VERB': 'KNOWN',
        'en:swim:VERB': 'LEARNING',
      },
    })

    renderWithProviders(<WordsPage />)

    expect(screen.getByText('Знаю')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('прогресс грузится → скелет вместо счётчиков', () => {
    useTopicStore.setState({ fetchRoots: vi.fn(), fetchView: vi.fn() })
    useMasteryStore.setState({ fetchMine: vi.fn(), status: 'loading', byId: {} })

    const { container } = renderWithProviders(<WordsPage />)

    expect(container.querySelector('.ant-skeleton')).toBeTruthy()
    expect(screen.queryByText('Знаю')).not.toBeInTheDocument()
  })

  it('прогресс не загрузился → счётчики просто не мешают', () => {
    useTopicStore.setState({ fetchRoots: vi.fn(), fetchView: vi.fn() })
    useMasteryStore.setState({
      fetchMine: vi.fn(),
      status: 'error',
      byId: {},
      error: { status: 500, code: 'x', message: 'm' },
    })

    renderWithProviders(<WordsPage />)

    expect(screen.queryByText('Знаю')).not.toBeInTheDocument()
  })

  it('первая ветка раскрывается сама', () => {
    const fetchView = vi.fn()
    useTopicStore.setState({
      fetchRoots: vi.fn(),
      fetchView,
      roots: [makeTopicRef()],
      rootsStatus: 'success',
    })
    useMasteryStore.setState({ fetchMine: vi.fn() })

    renderWithProviders(<WordsPage />)

    expect(fetchView).toHaveBeenCalledWith('t-travel')
  })

  it('показывает листья раскрытой ветки', () => {
    useTopicStore.setState({
      fetchRoots: vi.fn(),
      fetchView: vi.fn(),
      roots: [makeTopicRef()],
      rootsStatus: 'success',
      view: makeTopicView(),
      viewStatus: 'success',
    })
    useMasteryStore.setState({ fetchMine: vi.fn() })

    renderWithProviders(<WordsPage />)

    expect(screen.getByText('go')).toBeInTheDocument()
  })

  it('ошибка веток → «Повторить» перезагружает их', async () => {
    const fetchRoots = vi.fn()
    useTopicStore.setState({
      fetchRoots,
      fetchView: vi.fn(),
      roots: [],
      rootsStatus: 'error',
      rootsError: { status: 500, code: 'x', message: 'm' },
    })
    useMasteryStore.setState({ fetchMine: vi.fn() })

    renderWithProviders(<WordsPage />)
    fetchRoots.mockClear()

    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(fetchRoots).toHaveBeenCalled()
  })

  it('ошибка ветки → «Повторить» перезагружает её слова', async () => {
    const fetchView = vi.fn()
    useTopicStore.setState({
      fetchRoots: vi.fn(),
      fetchView,
      roots: [makeTopicRef()],
      rootsStatus: 'success',
      view: null,
      viewStatus: 'error',
      viewError: { status: 500, code: 'x', message: 'm' },
    })
    useMasteryStore.setState({ fetchMine: vi.fn() })

    renderWithProviders(<WordsPage />)
    fetchView.mockClear()

    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(fetchView).toHaveBeenCalledWith('t-travel')
  })

  it('клик по листу открывает слово, закрытие прячет карточку', async () => {
    useTopicStore.setState({
      fetchRoots: vi.fn(),
      fetchView: vi.fn(),
      roots: [makeTopicRef()],
      rootsStatus: 'success',
      view: makeTopicView(),
      viewStatus: 'success',
    })
    useMasteryStore.setState({ fetchMine: vi.fn() })
    useLexemeStore.setState({
      status: 'success',
      card: makeLexemeCard(),
      fetchCard: vi.fn(),
      clear: vi.fn(),
    })

    renderWithProviders(<WordsPage />)

    await userEvent.click(screen.getByText('go'))
    expect(await screen.findByText('Мой статус')).toBeInTheDocument()

    await userEvent.click(screen.getByLabelText('Close'))
    await waitFor(() =>
      expect(screen.queryByText('Мой статус')).not.toBeInTheDocument(),
    )
  })
})
