import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@shared/test/render'

import { AuthPage } from './AuthPage'

describe('<AuthPage>', () => {
  it('рендерит карточку авторизации и переключатель темы', () => {
    renderWithProviders(<AuthPage />)
    expect(screen.getByText('Вход в цифровой сад')).toBeInTheDocument()
    expect(screen.getByLabelText('Светлая')).toBeInTheDocument()
  })
})
