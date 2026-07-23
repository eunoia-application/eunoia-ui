import { httpClient } from '@shared/api'
import type {
  AuthResponse,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
} from '@shared/api'

/** Транспорт авторизации. Никакого состояния — только вызовы контракта. */
export const sessionApi = {
  async login(body: LoginRequest): Promise<AuthResponse> {
    const { data } = await httpClient.post<AuthResponse>('/auth/login', body)
    return data
  },

  async register(body: RegisterRequest): Promise<AuthResponse> {
    const { data } = await httpClient.post<AuthResponse>('/auth/register', body)
    return data
  },

  async refresh(body: RefreshTokenRequest): Promise<AuthResponse> {
    const { data } = await httpClient.post<AuthResponse>('/auth/refresh', body)
    return data
  },

  async logout(): Promise<void> {
    await httpClient.post('/auth/logout')
  },
}
