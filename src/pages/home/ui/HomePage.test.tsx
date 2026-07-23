import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useLexemeStore } from '@entities/lexeme'
import { useMasteryStore } from '@entities/mastery'
import { useSessionStore } from '@entities/session'
import { useTopicStore } from '@entities/topic'
import {
  makeAuthUser,
  makeLexemeCard,
  makeTopicRef,
  makeTopicView,
} from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { HomePage } from './HomePage'

afterEach(() => {
  useTopicStore.getState().reset()
  useMasteryStore.getState().reset()
  useLexemeStore.getState().clear()
})

describe('<HomePage>', () => {
  it('приветствие с именем + грузит ветки и мой прогресс', () => {
    const fetchRoots = vi.fn()
    const fetchMine = vi.fn()
    useSessionStore.setState({ user: makeAuthUser({ username: 'boris' }) })
    useTopicStore.setState({ fetchRoots, fetchView: vi.fn() })
    useMasteryStore.setState({ fetchMine })

    renderWithProviders(<HomePage />)

    expect(screen.getByText(/Здравствуйте/)).toBeInTheDocument()
    expect(fetchRoots).toHaveBeenCalled()
    expect(fetchMine).toHaveBeenCalled()
  })

  it('первая ветка раскрывается сама', () => {
    const fetchView = vi.fn()
    useSessionStore.setState({ user: makeAuthUser() })
    useTopicStore.setState({
      fetchRoots: vi.fn(),
      fetchView,
      roots: [makeTopicRef()],
      rootsStatus: 'success',
    })
    useMasteryStore.setState({ fetchMine: vi.fn() })

    renderWithProviders(<HomePage />)

    expect(fetchView).toHaveBeenCalledWith('t-travel')
  })

  it('показывает листья раскрытой ветки', () => {
    useSessionStore.setState({ user: makeAuthUser() })
    useTopicStore.setState({
      fetchRoots: vi.fn(),
      fetchView: vi.fn(),
      roots: [makeTopicRef()],
      rootsStatus: 'success',
      view: makeTopicView(),
      viewStatus: 'success',
    })
    useMasteryStore.setState({ fetchMine: vi.fn() })

    renderWithProviders(<HomePage />)

    expect(screen.getByText('go')).toBeInTheDocument()
  })

  it('ошибка веток → «Повторить» перезагружает их', async () => {
    const fetchRoots = vi.fn()
    useSessionStore.setState({ user: makeAuthUser() })
    useTopicStore.setState({
      fetchRoots,
      fetchView: vi.fn(),
      roots: [],
      rootsStatus: 'error',
      rootsError: { status: 500, code: 'x', message: 'm' },
    })
    useMasteryStore.setState({ fetchMine: vi.fn() })

    renderWithProviders(<HomePage />)
    fetchRoots.mockClear()

    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(fetchRoots).toHaveBeenCalled()
  })

  it('ошибка ветки → «Повторить» перезагружает её слова', async () => {
    const fetchView = vi.fn()
    useSessionStore.setState({ user: makeAuthUser() })
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

    renderWithProviders(<HomePage />)
    fetchView.mockClear()

    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(fetchView).toHaveBeenCalledWith('t-travel')
  })

  it('клик по листу открывает слово, закрытие прячет карточку', async () => {
    useSessionStore.setState({ user: makeAuthUser() })
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

    renderWithProviders(<HomePage />)

    await userEvent.click(screen.getByText('go'))
    expect(await screen.findByText('Мой статус')).toBeInTheDocument()

    await userEvent.click(screen.getByLabelText('Close'))
    await waitFor(() =>
      expect(screen.queryByText('Мой статус')).not.toBeInTheDocument(),
    )
  })
})
