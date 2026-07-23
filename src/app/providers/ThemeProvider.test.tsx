import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useThemeStore } from '@shared/theme'

import { ThemeProvider } from './ThemeProvider'

describe('<ThemeProvider>', () => {
  afterEach(() => useThemeStore.setState({ mode: 'system' }))

  it('dark → data-theme=dark + дети', () => {
    useThemeStore.setState({ mode: 'dark' })
    render(
      <ThemeProvider>
        <span>child</span>
      </ThemeProvider>,
    )
    expect(screen.getByText('child')).toBeInTheDocument()
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('light → data-theme=light', () => {
    useThemeStore.setState({ mode: 'light' })
    render(
      <ThemeProvider>
        <span>c</span>
      </ThemeProvider>,
    )
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
