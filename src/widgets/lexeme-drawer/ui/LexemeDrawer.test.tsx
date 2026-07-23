import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useLexemeStore } from '@entities/lexeme'
import { useMasteryStore } from '@entities/mastery'
import { makeLexemeCard } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { LexemeDrawer } from './LexemeDrawer'

const noop = { onClose: vi.fn(), onOpen: vi.fn() }

afterEach(() => {
  useLexemeStore.getState().clear()
  useMasteryStore.getState().reset()
})

describe('<LexemeDrawer>', () => {
  it('без выбранного слова закрыт и чистит карточку', () => {
    const clear = vi.fn()
    useLexemeStore.setState({ clear, fetchCard: vi.fn() })

    renderWithProviders(<LexemeDrawer lexemeId={null} {...noop} />)

    expect(clear).toHaveBeenCalled()
    expect(screen.queryByText('Мой статус')).not.toBeInTheDocument()
  })

  it('открытие грузит карточку', () => {
    const fetchCard = vi.fn()
    useLexemeStore.setState({ fetchCard, clear: vi.fn() })

    renderWithProviders(<LexemeDrawer lexemeId="en:go:VERB" {...noop} />)

    expect(fetchCard).toHaveBeenCalledWith('en:go:VERB')
  })

  it('loading → скелет', () => {
    useLexemeStore.setState({ status: 'loading', fetchCard: vi.fn(), clear: vi.fn() })

    const { baseElement } = renderWithProviders(
      <LexemeDrawer lexemeId="en:go:VERB" {...noop} />,
    )

    expect(baseElement.querySelector('.ant-skeleton')).toBeTruthy()
  })

  it('error → retry перезагружает слово', async () => {
    const fetchCard = vi.fn()
    useLexemeStore.setState({
      status: 'error',
      error: { status: 500, code: 'x', message: 'm' },
      fetchCard,
      clear: vi.fn(),
    })

    renderWithProviders(<LexemeDrawer lexemeId="en:go:VERB" {...noop} />)
    expect(screen.getByText('Не удалось открыть слово')).toBeInTheDocument()

    fetchCard.mockClear()
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(fetchCard).toHaveBeenCalledWith('en:go:VERB')
  })

  it('карточка: часть речи, уровень, переводы, формы и связи', () => {
    useLexemeStore.setState({
      status: 'success',
      card: makeLexemeCard(),
      fetchCard: vi.fn(),
      clear: vi.fn(),
    })

    renderWithProviders(<LexemeDrawer lexemeId="en:go:VERB" {...noop} />)

    expect(screen.getByText('глагол')).toBeInTheDocument()
    expect(screen.getByText('A1')).toBeInTheDocument()
    expect(screen.getByText(/частотность/)).toBeInTheDocument()
    expect(screen.getByText('идти')).toBeInTheDocument()
    expect(screen.getByText('went')).toBeInTheDocument()
    expect(screen.getByText('Синонимы')).toBeInTheDocument()
    expect(screen.getByText('Мой статус')).toBeInTheDocument()
  })

  it('клик по синониму открывает соседнее слово', async () => {
    const onOpen = vi.fn()
    useLexemeStore.setState({
      status: 'success',
      card: makeLexemeCard(),
      fetchCard: vi.fn(),
      clear: vi.fn(),
    })

    renderWithProviders(
      <LexemeDrawer lexemeId="en:go:VERB" onClose={vi.fn()} onOpen={onOpen} />,
    )
    await userEvent.click(screen.getByText('walk'))

    expect(onOpen).toHaveBeenCalledWith('en:walk:VERB')
  })

  it('карточка без связей и деталей не падает', () => {
    useLexemeStore.setState({
      status: 'success',
      card: makeLexemeCard({
        pos: undefined,
        cefr: undefined,
        freqRank: null,
        forms: [],
        translations: [],
        synonyms: [],
      }),
      fetchCard: vi.fn(),
      clear: vi.fn(),
    })

    renderWithProviders(<LexemeDrawer lexemeId="en:go:VERB" {...noop} />)

    expect(screen.getByText('Мой статус')).toBeInTheDocument()
    expect(screen.queryByText('Синонимы')).not.toBeInTheDocument()
  })
})
