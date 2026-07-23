import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@shared/test/render'

import { AuthCard } from './AuthCard'

function stubMobile(isMobile: boolean) {
  vi.spyOn(window, 'matchMedia').mockReturnValue({
    matches: isMobile,
    media: '',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(), // framer-motion (prefers-reduced-motion) использует legacy API
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList)
}

describe('<AuthCard>', () => {
  afterEach(() => vi.restoreAllMocks())

  it('десктоп → split-overlay', () => {
    stubMobile(false)
    renderWithProviders(<AuthCard />)
    expect(screen.getByText('Нет сада?')).toBeInTheDocument()
  })

  it('мобайл → табы, переключение работает', async () => {
    stubMobile(true)
    renderWithProviders(<AuthCard />)
    expect(screen.getByText('Регистрация')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Регистрация'))
    expect(screen.getByText('Создать сад')).toBeInTheDocument()
  })
})
