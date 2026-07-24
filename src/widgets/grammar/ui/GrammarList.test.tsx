import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { makeGrammarView } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { GrammarList } from './GrammarList'

const base = {
  rules: [],
  status: 'idle' as const,
  error: null,
  activeId: null,
  onOpen: vi.fn(),
  onRetry: vi.fn(),
}

describe('<GrammarList>', () => {
  it('loading без данных → скелет', () => {
    const { container } = renderWithProviders(<GrammarList {...base} status="loading" />)
    expect(container.querySelector('.ant-skeleton')).toBeTruthy()
  })

  it('error без данных → retry', async () => {
    const onRetry = vi.fn()
    renderWithProviders(
      <GrammarList
        {...base}
        status="error"
        error={{ status: 500, code: 'x', message: 'm' }}
        onRetry={onRetry}
      />,
    )
    expect(screen.getByText('Не удалось загрузить ствол')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(onRetry).toHaveBeenCalled()
  })

  it('success без правил → empty-state', () => {
    renderWithProviders(<GrammarList {...base} status="success" />)
    expect(screen.getByText('Правил пока нет')).toBeInTheDocument()
  })

  it('правила по уровням, клик открывает правило', async () => {
    const onOpen = vi.fn()
    renderWithProviders(
      <GrammarList
        {...base}
        status="success"
        rules={[
          makeGrammarView({ id: 'a1', name: 'Present Simple', cefr: 'A1', prerequisites: [] }),
          makeGrammarView({ id: 'a2', name: 'Past Simple', cefr: 'A2' }),
        ]}
        onOpen={onOpen}
      />,
    )
    expect(screen.getByText('A1')).toBeInTheDocument()
    expect(screen.getByText('A2')).toBeInTheDocument()
    // у Past Simple есть предпосылка — показываем счётчик
    expect(screen.getByText('сначала: 1')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Past Simple'))
    expect(onOpen).toHaveBeenCalledWith('a2')
  })
})
