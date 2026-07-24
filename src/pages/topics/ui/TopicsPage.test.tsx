import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useMasteryStore } from '@entities/mastery'
import { useTopicStore } from '@entities/topic'
import { useWordStore } from '@entities/word'
import { makeTopicRef, makeTopicView, makeWordCard } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { TopicsPage } from './TopicsPage'

afterEach(() => {
  useTopicStore.getState().reset()
  useMasteryStore.getState().reset()
  useWordStore.getState().clearCard()
})

describe('<TopicsPage>', () => {
  it('грузит темы и мой прогресс', () => {
    const fetchRoots = vi.fn()
    const fetchMine = vi.fn()
    useTopicStore.setState({ fetchRoots, fetchView: vi.fn() })
    useMasteryStore.setState({ fetchMine })

    renderWithProviders(<TopicsPage />)

    expect(screen.getByText('Темы')).toBeInTheDocument()
    expect(fetchRoots).toHaveBeenCalled()
    expect(fetchMine).toHaveBeenCalled()
  })

  it('темы грузятся → скелет', () => {
    useTopicStore.setState({ fetchRoots: vi.fn(), fetchView: vi.fn(), roots: [], rootsStatus: 'loading' })
    useMasteryStore.setState({ fetchMine: vi.fn() })
    const { container } = renderWithProviders(<TopicsPage />)
    expect(container.querySelector('.ant-skeleton')).toBeTruthy()
  })

  it('тема грузится → скелет', () => {
    useTopicStore.setState({
      fetchRoots: vi.fn(),
      fetchView: vi.fn(),
      roots: [makeTopicRef()],
      rootsStatus: 'success',
      view: null,
      viewStatus: 'loading',
    })
    useMasteryStore.setState({ fetchMine: vi.fn() })
    const { container } = renderWithProviders(<TopicsPage />)
    expect(container.querySelector('.ant-skeleton')).toBeTruthy()
  })

  it('нет тем → empty-state', () => {
    useTopicStore.setState({ fetchRoots: vi.fn(), fetchView: vi.fn(), roots: [], rootsStatus: 'success' })
    useMasteryStore.setState({ fetchMine: vi.fn() })

    renderWithProviders(<TopicsPage />)
    expect(screen.getByText('Тем пока нет')).toBeInTheDocument()
  })

  it('ошибка тем → «Повторить»', async () => {
    const fetchRoots = vi.fn()
    useTopicStore.setState({
      fetchRoots,
      fetchView: vi.fn(),
      roots: [],
      rootsStatus: 'error',
      rootsError: { status: 500, code: 'x', message: 'm' },
    })
    useMasteryStore.setState({ fetchMine: vi.fn() })

    renderWithProviders(<TopicsPage />)
    fetchRoots.mockClear()
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(fetchRoots).toHaveBeenCalled()
  })

  it('первая тема раскрывается сама', () => {
    const fetchView = vi.fn()
    useTopicStore.setState({
      fetchRoots: vi.fn(),
      fetchView,
      roots: [makeTopicRef()],
      rootsStatus: 'success',
    })
    useMasteryStore.setState({ fetchMine: vi.fn() })

    renderWithProviders(<TopicsPage />)
    expect(fetchView).toHaveBeenCalledWith('t-travel')
  })

  it('клик по другой теме выбирает её', async () => {
    const fetchView = vi.fn()
    useTopicStore.setState({
      fetchRoots: vi.fn(),
      fetchView,
      roots: [makeTopicRef(), makeTopicRef({ id: 't-food', name: 'Еда' })],
      rootsStatus: 'success',
    })
    useMasteryStore.setState({ fetchMine: vi.fn() })

    renderWithProviders(<TopicsPage />)
    fetchView.mockClear()
    await userEvent.click(screen.getByRole('button', { name: /Еда/ }))
    expect(fetchView).toHaveBeenCalledWith('t-food')
  })

  it('показывает слова темы', () => {
    useTopicStore.setState({
      fetchRoots: vi.fn(),
      fetchView: vi.fn(),
      roots: [makeTopicRef()],
      rootsStatus: 'success',
      view: makeTopicView(),
      viewStatus: 'success',
    })
    useMasteryStore.setState({ fetchMine: vi.fn() })

    renderWithProviders(<TopicsPage />)
    expect(screen.getByText('go')).toBeInTheDocument()
  })

  it('пустая тема → empty-state', () => {
    useTopicStore.setState({
      fetchRoots: vi.fn(),
      fetchView: vi.fn(),
      roots: [makeTopicRef()],
      rootsStatus: 'success',
      view: makeTopicView({ words: [] }),
      viewStatus: 'success',
    })
    useMasteryStore.setState({ fetchMine: vi.fn() })

    renderWithProviders(<TopicsPage />)
    expect(screen.getByText('В теме пока нет слов')).toBeInTheDocument()
  })

  it('ошибка темы → «Повторить»', async () => {
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

    renderWithProviders(<TopicsPage />)
    fetchView.mockClear()
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(fetchView).toHaveBeenCalledWith('t-travel')
  })

  it('клик по слову открывает карточку', async () => {
    useTopicStore.setState({
      fetchRoots: vi.fn(),
      fetchView: vi.fn(),
      roots: [makeTopicRef()],
      rootsStatus: 'success',
      view: makeTopicView(),
      viewStatus: 'success',
    })
    useMasteryStore.setState({ fetchMine: vi.fn() })
    useWordStore.setState({
      card: makeWordCard(),
      cardStatus: 'success',
      fetchCard: vi.fn(),
      clearCard: vi.fn(),
    })

    renderWithProviders(<TopicsPage />)
    await userEvent.click(screen.getByText('go'))
    expect(await screen.findByText('Мой статус')).toBeInTheDocument()

    await userEvent.click(document.querySelector('.ant-modal-close') as HTMLElement)
    await waitFor(() => expect(screen.queryByText('Мой статус')).not.toBeInTheDocument())
  })
})
