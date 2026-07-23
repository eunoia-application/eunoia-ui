import type { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import { useSessionStore } from '@entities/session'
import { PATHS } from '@shared/config'

/** Пускает дальше только авторизованных, иначе — на /auth. */
export function ProtectedRoute() {
  const authed = useSessionStore((state) => Boolean(state.accessToken))
  return authed ? <Outlet /> : <Navigate to={PATHS.auth} replace />
}

/** Обратное: авторизованного уводит с гостевых страниц на домашнюю. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const authed = useSessionStore((state) => Boolean(state.accessToken))
  return authed ? <Navigate to={PATHS.home} replace /> : <>{children}</>
}
