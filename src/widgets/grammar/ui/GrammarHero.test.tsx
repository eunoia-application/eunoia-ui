import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { makeGrammarView } from '@shared/test/factories'
import { renderWithProviders } from '@shared/test/render'

import { GrammarHero } from './GrammarHero'

describe('<GrammarHero>', () => {
  it('loading без правил → скелет', () => {
    const { container } = renderWithProviders(<GrammarHero rules={[]} status="loading" />)
    expect(container.querySelector('.ant-skeleton')).toBeTruthy()
  })

  it('success без правил → ничего', () => {
    const { container } = renderWithProviders(<GrammarHero rules={[]} status="success" />)
    expect(container.querySelector('.ant-card')).toBeNull()
  })

  it('обзор: число правил и разбивка по уровням', () => {
    renderWithProviders(
      <GrammarHero
        status="success"
        rules={[
          makeGrammarView({ id: 'r1', cefr: 'A1' }),
          makeGrammarView({ id: 'r2', cefr: 'A2' }),
          makeGrammarView({ id: 'r3', cefr: undefined }),
        ]}
      />,
    )
    expect(screen.getByText('Ствол грамматики')).toBeInTheDocument()
    expect(screen.getByText('A1: 1')).toBeInTheDocument()
    expect(screen.getByText('A2: 1')).toBeInTheDocument()
    expect(screen.getByText('Без уровня: 1')).toBeInTheDocument()
  })
})
