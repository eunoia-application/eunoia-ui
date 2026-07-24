import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useMasteryStore } from '@entities/mastery'
import { useWordStore } from '@entities/word'
import { makeWordCard, makeWordVariant } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { WordModal } from './WordModal'

const noop = { onClose: vi.fn(), onOpen: vi.fn() }

afterEach(() => {
  useWordStore.getState().clearCard()
  useMasteryStore.getState().reset()
})

describe('<WordModal>', () => {
  it('без слова закрыт и чистит карточку', () => {
    const clearCard = vi.fn()
    useWordStore.setState({ clearCard, fetchCard: vi.fn() })
    renderWithProviders(<WordModal wordId={null} {...noop} />)
    expect(clearCard).toHaveBeenCalled()
  })

  it('открытие грузит карточку', () => {
    const fetchCard = vi.fn()
    useWordStore.setState({ fetchCard, clearCard: vi.fn() })
    renderWithProviders(<WordModal wordId="en:go" {...noop} />)
    expect(fetchCard).toHaveBeenCalledWith('en:go')
  })

  it('loading → скелет', () => {
    useWordStore.setState({ cardStatus: 'loading', fetchCard: vi.fn(), clearCard: vi.fn() })
    const { baseElement } = renderWithProviders(<WordModal wordId="en:go" {...noop} />)
    expect(baseElement.querySelector('.ant-skeleton')).toBeTruthy()
  })

  it('error → retry перезагружает', async () => {
    const fetchCard = vi.fn()
    useWordStore.setState({
      cardStatus: 'error',
      cardError: { status: 500, code: 'x', message: 'm' },
      fetchCard,
      clearCard: vi.fn(),
    })
    renderWithProviders(<WordModal wordId="en:go" {...noop} />)
    expect(screen.getByText('Не удалось открыть слово')).toBeInTheDocument()
    fetchCard.mockClear()
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(fetchCard).toHaveBeenCalledWith('en:go')
  })

  it('карточка: ipa, статус и вариант со связями', () => {
    useWordStore.setState({
      cardStatus: 'success',
      card: makeWordCard(),
      fetchCard: vi.fn(),
      clearCard: vi.fn(),
    })
    renderWithProviders(<WordModal wordId="en:go" {...noop} />)
    expect(screen.getByText('/ɡoʊ/')).toBeInTheDocument()
    expect(screen.getByText('Мой статус')).toBeInTheDocument()
    expect(screen.getByText('глагол')).toBeInTheDocument()
    expect(screen.getByText('идти')).toBeInTheDocument()
    expect(screen.getByText('went')).toBeInTheDocument()
    expect(screen.getByText('Синонимы')).toBeInTheDocument()
    expect(screen.getByText('walk')).toBeInTheDocument()
  })

  it('клик по синониму открывает соседнее слово', async () => {
    const onOpen = vi.fn()
    useWordStore.setState({
      cardStatus: 'success',
      card: makeWordCard(),
      fetchCard: vi.fn(),
      clearCard: vi.fn(),
    })
    renderWithProviders(<WordModal wordId="en:go" onClose={vi.fn()} onOpen={onOpen} />)
    await userEvent.click(screen.getByText('walk'))
    expect(onOpen).toHaveBeenCalledWith('en:walk')
  })

  it('несколько частей речи — несколько вариантов', () => {
    useWordStore.setState({
      cardStatus: 'success',
      card: makeWordCard({
        variants: [
          makeWordVariant({ pos: 'VERB' }),
          makeWordVariant({
            pos: 'NOUN',
            cefr: undefined,
            freqRank: null,
            translations: [],
            forms: [],
            synonyms: [],
            antonyms: [],
            hypernyms: [],
          }),
        ],
      }),
      fetchCard: vi.fn(),
      clearCard: vi.fn(),
    })
    renderWithProviders(<WordModal wordId="en:go" {...noop} />)
    expect(screen.getByText('глагол')).toBeInTheDocument()
    expect(screen.getByText('существительное')).toBeInTheDocument()
  })

  it('карточка без вариантов — честная подпись', () => {
    useWordStore.setState({
      cardStatus: 'success',
      card: makeWordCard({ ipa: null, freqRank: null, variants: [] }),
      fetchCard: vi.fn(),
      clearCard: vi.fn(),
    })
    renderWithProviders(<WordModal wordId="en:go" {...noop} />)
    expect(screen.getByText('Детали для этого слова пока не заполнены.')).toBeInTheDocument()
  })
})
