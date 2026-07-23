import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@shared/test/render'

import { GrammarPage } from './GrammarPage'

describe('<GrammarPage>', () => {
  it('честно сообщает, что контракт не отдаёт списка правил', () => {
    renderWithProviders(<GrammarPage />)
    expect(screen.getByText('Грамматика')).toBeInTheDocument()
    expect(screen.getByText('Раздел ждёт контракт')).toBeInTheDocument()
  })
})
