import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useGrammarStore } from '@entities/grammar'
import { useWordStore } from '@entities/word'
import { makeGrammarView, makeWordCard } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { GrammarPage } from './GrammarPage'

afterEach(() => {
  useGrammarStore.getState().reset()
  useWordStore.getState().clearCard()
})

describe('<GrammarPage>', () => {
  it('грузит ствол при монтировании', () => {
    const fetchAll = vi.fn()
    useGrammarStore.setState({ fetchAll, fetchRule: vi.fn() })
    renderWithProviders(<GrammarPage />)
    expect(screen.getByText('Грамматика')).toBeInTheDocument()
    expect(fetchAll).toHaveBeenCalled()
  })

  it('ошибка ствола → «Повторить» перезагружает', async () => {
    const fetchAll = vi.fn()
    useGrammarStore.setState({
      fetchAll,
      fetchRule: vi.fn(),
      rules: [],
      listStatus: 'error',
      listError: { status: 500, code: 'x', message: 'm' },
    })
    renderWithProviders(<GrammarPage />)
    fetchAll.mockClear()
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(fetchAll).toHaveBeenCalled()
  })

  it('клик по правилу открывает его детали', async () => {
    useGrammarStore.setState({
      fetchAll: vi.fn(),
      fetchRule: vi.fn(),
      clearRule: vi.fn(),
      rules: [makeGrammarView({ id: 'a2', name: 'Past Simple', cefr: 'A2' })],
      listStatus: 'success',
      rule: makeGrammarView({ id: 'a2', name: 'Past Simple' }),
      ruleStatus: 'success',
    })
    renderWithProviders(<GrammarPage />)
    await userEvent.click(screen.getByText('Past Simple'))
    expect(await screen.findByText('Слова-примеры')).toBeInTheDocument()
  })

  it('закрытие правила прячет детали', async () => {
    useGrammarStore.setState({
      fetchAll: vi.fn(),
      fetchRule: vi.fn(),
      clearRule: vi.fn(),
      rules: [makeGrammarView({ id: 'a2', name: 'Past Simple' })],
      listStatus: 'success',
      rule: makeGrammarView({ id: 'a2', name: 'Past Simple' }),
      ruleStatus: 'success',
    })
    renderWithProviders(<GrammarPage />)
    await userEvent.click(screen.getByText('Past Simple'))
    expect(await screen.findByText('Слова-примеры')).toBeInTheDocument()
    await userEvent.click(document.querySelector('.ant-modal-close') as HTMLElement)
    await waitFor(() =>
      expect(screen.queryByText('Слова-примеры')).not.toBeInTheDocument(),
    )
  })

  it('слово-пример из правила открывает карточку слова', async () => {
    useGrammarStore.setState({
      fetchAll: vi.fn(),
      fetchRule: vi.fn(),
      clearRule: vi.fn(),
      rules: [makeGrammarView({ id: 'a2', name: 'Past Simple' })],
      listStatus: 'success',
      rule: makeGrammarView({ id: 'a2', name: 'Past Simple' }),
      ruleStatus: 'success',
    })
    useWordStore.setState({
      card: makeWordCard(),
      cardStatus: 'success',
      fetchCard: vi.fn(),
      clearCard: vi.fn(),
    })
    renderWithProviders(<GrammarPage />)
    await userEvent.click(screen.getByText('Past Simple'))
    await userEvent.click(await screen.findByText('went'))
    await waitFor(() => expect(screen.getByText('Мой статус')).toBeInTheDocument())

    // Открыты обе модалки — закрываем верхнюю (карточку слова).
    const closes = document.querySelectorAll('.ant-modal-close')
    await userEvent.click(closes[closes.length - 1] as HTMLElement)
    await waitFor(() => expect(screen.queryByText('Мой статус')).not.toBeInTheDocument())
  })
})
