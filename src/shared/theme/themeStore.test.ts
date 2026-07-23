import { beforeEach, describe, expect, it } from 'vitest'

import { useThemeStore } from './themeStore'

describe('themeStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useThemeStore.setState({ mode: 'system' })
  })

  it('setMode задаёт режим', () => {
    useThemeStore.getState().setMode('dark')
    expect(useThemeStore.getState().mode).toBe('dark')
  })
  it('toggle: dark → light', () => {
    useThemeStore.setState({ mode: 'dark' })
    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().mode).toBe('light')
  })
  it('toggle: не-dark → dark', () => {
    useThemeStore.setState({ mode: 'light' })
    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().mode).toBe('dark')
  })
})
