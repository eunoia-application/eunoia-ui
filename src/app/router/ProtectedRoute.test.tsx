import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { useSessionStore } from '@entities/session'

import { GuestOnly, ProtectedRoute } from './ProtectedRoute'

function renderProtected(initial: string) {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/auth" element={<div>AUTH</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/secret" element={<div>SECRET</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

function renderGuest(initial: string) {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/" element={<div>HOME</div>} />
        <Route
          path="/auth"
          element={
            <GuestOnly>
              <div>LOGIN</div>
            </GuestOnly>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute / GuestOnly', () => {
  it('Protected без сессии → /auth', () => {
    useSessionStore.setState({ accessToken: null })
    renderProtected('/secret')
    expect(screen.getByText('AUTH')).toBeInTheDocument()
  })

  it('Protected с сессией → контент', () => {
    useSessionStore.setState({ accessToken: 'tok' })
    renderProtected('/secret')
    expect(screen.getByText('SECRET')).toBeInTheDocument()
  })

  it('GuestOnly с сессией → home', () => {
    useSessionStore.setState({ accessToken: 'tok' })
    renderGuest('/auth')
    expect(screen.getByText('HOME')).toBeInTheDocument()
  })

  it('GuestOnly без сессии → children', () => {
    useSessionStore.setState({ accessToken: null })
    renderGuest('/auth')
    expect(screen.getByText('LOGIN')).toBeInTheDocument()
  })
})
