import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useThemeStore } from './themeStore'
import { useResolvedTheme } from './useResolvedTheme'

function stubPrefersDark(matches: boolean) {
  vi.spyOn(window, 'matchMedia').mockReturnValue({
    matches,
    media: '',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as MediaQueryList)
}

describe('useResolvedTheme', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    useThemeStore.setState({ mode: 'system' })
  })

  it('mode=light → light', () => {
    stubPrefersDark(false)
    useThemeStore.setState({ mode: 'light' })
    expect(renderHook(() => useResolvedTheme()).result.current).toBe('light')
  })
  it('mode=dark → dark', () => {
    stubPrefersDark(false)
    useThemeStore.setState({ mode: 'dark' })
    expect(renderHook(() => useResolvedTheme()).result.current).toBe('dark')
  })
  it('mode=system + prefers dark → dark', () => {
    stubPrefersDark(true)
    useThemeStore.setState({ mode: 'system' })
    expect(renderHook(() => useResolvedTheme()).result.current).toBe('dark')
  })
  it('mode=system + prefers light → light', () => {
    stubPrefersDark(false)
    useThemeStore.setState({ mode: 'system' })
    expect(renderHook(() => useResolvedTheme()).result.current).toBe('light')
  })
})
