import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { isApiError } from '@shared/api'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RequestStatus,
  UserProfile,
} from '@shared/api'
import { STORAGE_KEYS } from '@shared/config'

import { sessionApi } from '../api/sessionApi'

interface SessionState {
  accessToken: string | null
  refreshToken: string | null
  user: UserProfile | null
  status: RequestStatus
  error: string | null

  login: (body: LoginRequest) => Promise<void>
  register: (body: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  /** Возвращает новый access-токен или null (для authBridge). */
  refresh: () => Promise<string | null>
  setUser: (user: UserProfile) => void
  clear: () => void
  isAuthenticated: () => boolean
}

const initial = {
  accessToken: null,
  refreshToken: null,
  user: null,
  status: 'idle' as RequestStatus,
  error: null,
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => {
      const applyAuth = (res: AuthResponse) => {
        set({
          accessToken: res.accessToken,
          refreshToken: res.refreshToken ?? null,
          user: res.user,
          status: 'success',
          error: null,
        })
      }

      const runAuth = async (call: Promise<AuthResponse>) => {
        set({ status: 'loading', error: null })
        try {
          applyAuth(await call)
        } catch (error) {
          set({
            status: 'error',
            error: isApiError(error) ? error.message : 'Ошибка авторизации',
          })
          throw error
        }
      }

      return {
        ...initial,

        login: (body) => runAuth(sessionApi.login(body)),
        register: (body) => runAuth(sessionApi.register(body)),

        logout: async () => {
          try {
            await sessionApi.logout()
          } catch {
            // токены всё равно чистим локально
          }
          set({ ...initial })
        },

        refresh: async () => {
          const token = get().refreshToken
          if (!token) return null
          try {
            const res = await sessionApi.refresh({ refreshToken: token })
            applyAuth(res)
            return res.accessToken
          } catch {
            set({ ...initial })
            return null
          }
        },

        setUser: (user) => set({ user }),
        clear: () => set({ ...initial }),
        isAuthenticated: () => Boolean(get().accessToken),
      }
    },
    {
      name: STORAGE_KEYS.session,
      // Персистим только данные, не статусы/ошибки.
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
)
