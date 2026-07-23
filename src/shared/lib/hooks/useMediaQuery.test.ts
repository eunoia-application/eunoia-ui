import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useMediaQuery } from './useMediaQuery'

type ChangeHandler = (event: MediaQueryListEvent) => void

function stubMatchMedia(initial: boolean) {
  let handler: ChangeHandler | null = null
  const remove = vi.fn()
  const mql = {
    matches: initial,
    media: '',
    addEventListener: (_: string, h: ChangeHandler) => {
      handler = h
    },
    removeEventListener: remove,
  }
  vi.spyOn(window, 'matchMedia').mockReturnValue(mql as unknown as MediaQueryList)
  return { fire: (m: boolean) => handler?.({ matches: m } as MediaQueryListEvent), remove }
}

describe('useMediaQuery', () => {
  afterEach(() => vi.restoreAllMocks())

  it('возвращает matches и реагирует на change', () => {
    const { fire } = stubMatchMedia(true)
    const { result } = renderHook(() => useMediaQuery('(max-width: 700px)'))
    expect(result.current).toBe(true)
    act(() => fire(false))
    expect(result.current).toBe(false)
  })

  it('снимает подписку при размонтировании', () => {
    const { remove } = stubMatchMedia(false)
    const { unmount } = renderHook(() => useMediaQuery('(x)'))
    unmount()
    expect(remove).toHaveBeenCalled()
  })
})
