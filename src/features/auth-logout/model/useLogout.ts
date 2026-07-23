import { useNavigate } from 'react-router-dom'

import { useSessionStore } from '@entities/session'
import { useUserStore } from '@entities/user'
import { PATHS } from '@shared/config'

/** Действие выхода: чистит сессию и профиль, уводит на страницу входа. */
export function useLogout(): () => Promise<void> {
  const navigate = useNavigate()
  const logout = useSessionStore((state) => state.logout)
  const resetUser = useUserStore((state) => state.reset)

  return async () => {
    await logout()
    resetUser()
    navigate(PATHS.auth, { replace: true })
  }
}
