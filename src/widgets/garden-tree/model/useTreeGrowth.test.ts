import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { makeBand } from '@shared/test/factories'

import { useTreeGrowth } from './useTreeGrowth'

describe('useTreeGrowth', () => {
  it('считает состояние роста и мемоизирует по ссылке на данные', () => {
    const bands = [makeBand({ known: 42, learning: 3 })]
    const { result, rerender } = renderHook(({ b }) => useTreeGrowth(b), {
      initialProps: { b: bands },
    })
    expect(result.current.known).toBe(42)
    const first = result.current
    rerender({ b: bands })
    expect(result.current).toBe(first)
    rerender({ b: [makeBand({ known: 100, learning: 0 })] })
    expect(result.current.known).toBe(100)
    expect(result.current).not.toBe(first)
  })
})
