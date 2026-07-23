import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { useSessionStore } from '@entities/session'
import { useUserStore } from '@entities/user'

import { useLogout } from './useLogout'

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
)

describe('useLogout', () => {
  it('чистит сессию и профиль', async () => {
    const logout = vi.fn().mockResolvedValue(undefined)
    const reset = vi.fn()
    useSessionStore.setState({ logout })
    useUserStore.setState({ reset })

    const { result } = renderHook(() => useLogout(), { wrapper })
    await result.current()

    expect(logout).toHaveBeenCalledTimes(1)
    expect(reset).toHaveBeenCalledTimes(1)
  })
})
