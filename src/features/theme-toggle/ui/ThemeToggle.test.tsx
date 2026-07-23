import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import { useThemeStore } from '@shared/theme'

import { ThemeToggle } from './ThemeToggle'

afterEach(() => useThemeStore.setState({ mode: 'system' }))

describe('<ThemeToggle>', () => {
  it('«Светлая» → light', async () => {
    render(<ThemeToggle />)
    await userEvent.click(screen.getByLabelText('Светлая'))
    expect(useThemeStore.getState().mode).toBe('light')
  })
  it('«Тёмная» → dark', async () => {
    render(<ThemeToggle />)
    await userEvent.click(screen.getByLabelText('Тёмная'))
    expect(useThemeStore.getState().mode).toBe('dark')
  })
  it('«Система» → system', async () => {
    useThemeStore.setState({ mode: 'dark' })
    render(<ThemeToggle />)
    await userEvent.click(screen.getByLabelText('Система'))
    expect(useThemeStore.getState().mode).toBe('system')
  })
})
