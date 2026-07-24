import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useGrammarStore } from '@entities/grammar'
import { makeGrammarView, makeWordRef } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { GrammarModal } from './GrammarModal'

const noop = { onClose: vi.fn(), onOpenRule: vi.fn(), onOpenWord: vi.fn() }

afterEach(() => useGrammarStore.getState().reset())

describe('<GrammarModal>', () => {
  it('без правила закрыт и чистит открытое', () => {
    const clearRule = vi.fn()
    useGrammarStore.setState({ clearRule, fetchRule: vi.fn() })
    renderWithProviders(<GrammarModal ruleId={null} {...noop} />)
    expect(clearRule).toHaveBeenCalled()
  })

  it('открытие грузит правило', () => {
    const fetchRule = vi.fn()
    useGrammarStore.setState({ fetchRule, clearRule: vi.fn() })
    renderWithProviders(<GrammarModal ruleId="gr:past-simple" {...noop} />)
    expect(fetchRule).toHaveBeenCalledWith('gr:past-simple')
  })

  it('loading → скелет', () => {
    useGrammarStore.setState({ ruleStatus: 'loading', fetchRule: vi.fn(), clearRule: vi.fn() })
    const { baseElement } = renderWithProviders(
      <GrammarModal ruleId="gr:past-simple" {...noop} />,
    )
    expect(baseElement.querySelector('.ant-skeleton')).toBeTruthy()
  })

  it('error → retry перезагружает правило', async () => {
    const fetchRule = vi.fn()
    useGrammarStore.setState({
      ruleStatus: 'error',
      ruleError: { status: 500, code: 'x', message: 'm' },
      fetchRule,
      clearRule: vi.fn(),
    })
    renderWithProviders(<GrammarModal ruleId="gr:past-simple" {...noop} />)
    expect(screen.getByText('Не удалось открыть правило')).toBeInTheDocument()
    fetchRule.mockClear()
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(fetchRule).toHaveBeenCalledWith('gr:past-simple')
  })

  it('детали: уровень, предпосылки (имя из ствола) и слова-примеры', () => {
    useGrammarStore.setState({
      ruleStatus: 'success',
      rule: makeGrammarView({
        illustratedBy: [
          makeWordRef({ id: 'en:went', lemma: 'went' }),
          makeWordRef({ id: 'en:raw', lemma: 'raw', pos: undefined }),
        ],
      }),
      rules: [makeGrammarView({ id: 'gr:present-simple', name: 'Present Simple' })],
      fetchRule: vi.fn(),
      clearRule: vi.fn(),
    })
    renderWithProviders(<GrammarModal ruleId="gr:past-simple" {...noop} />)
    expect(screen.getByText('A2')).toBeInTheDocument()
    expect(screen.getByText('Сначала изучите')).toBeInTheDocument()
    expect(screen.getByText('Present Simple')).toBeInTheDocument()
    expect(screen.getByText('Слова-примеры')).toBeInTheDocument()
    expect(screen.getByText('went')).toBeInTheDocument()
  })

  it('клик по предпосылке уводит к её правилу', async () => {
    const onOpenRule = vi.fn()
    useGrammarStore.setState({
      ruleStatus: 'success',
      rule: makeGrammarView(),
      rules: [],
      fetchRule: vi.fn(),
      clearRule: vi.fn(),
    })
    renderWithProviders(
      <GrammarModal
        ruleId="gr:past-simple"
        onClose={vi.fn()}
        onOpenRule={onOpenRule}
        onOpenWord={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByText('gr:present-simple'))
    expect(onOpenRule).toHaveBeenCalledWith('gr:present-simple')
  })

  it('клик по слову-примеру открывает карточку слова', async () => {
    const onOpenWord = vi.fn()
    useGrammarStore.setState({
      ruleStatus: 'success',
      rule: makeGrammarView(),
      rules: [],
      fetchRule: vi.fn(),
      clearRule: vi.fn(),
    })
    renderWithProviders(
      <GrammarModal
        ruleId="gr:past-simple"
        onClose={vi.fn()}
        onOpenRule={vi.fn()}
        onOpenWord={onOpenWord}
      />,
    )
    await userEvent.click(screen.getByText('went'))
    expect(onOpenWord).toHaveBeenCalledWith('en:went')
  })

  it('правило без предпосылок и примеров — честная подпись', () => {
    useGrammarStore.setState({
      ruleStatus: 'success',
      rule: makeGrammarView({ prerequisites: [], illustratedBy: [], cefr: undefined }),
      rules: [],
      fetchRule: vi.fn(),
      clearRule: vi.fn(),
    })
    renderWithProviders(<GrammarModal ruleId="gr:past-simple" {...noop} />)
    expect(screen.getByText('Примеры для этого правила пока не привязаны.')).toBeInTheDocument()
    expect(screen.queryByText('Сначала изучите')).not.toBeInTheDocument()
  })
})
