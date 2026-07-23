import { httpClient } from '@shared/api'
import type {
  ChangePasswordRequest,
  UserProfile,
  UserUpdateRequest,
} from '@shared/api'

/** Транспорт профиля пользователя. */
export const userApi = {
  async getCurrentUser(): Promise<UserProfile> {
    const { data } = await httpClient.get<UserProfile>('/users/me')
    return data
  },

  async updateCurrentUser(body: UserUpdateRequest): Promise<UserProfile> {
    const { data } = await httpClient.put<UserProfile>('/users/me', body)
    return data
  },

  async changePassword(body: ChangePasswordRequest): Promise<void> {
    await httpClient.put('/users/me/password', body)
  },
}
