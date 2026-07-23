import { httpClient } from '@shared/api'
import type {
  UserDataExport,
  UserProfile,
  UserSettings,
  UserUpdateRequest,
} from '@shared/api'

/** Транспорт профиля пользователя. Все мутации возвращают полный UserProfile. */
export const userApi = {
  async getCurrentUser(): Promise<UserProfile> {
    const { data } = await httpClient.get<UserProfile>('/users/me')
    return data
  },

  async updateCurrentUser(body: UserUpdateRequest): Promise<UserProfile> {
    const { data } = await httpClient.put<UserProfile>('/users/me', body)
    return data
  },

  async updateSettings(body: UserSettings): Promise<UserProfile> {
    const { data } = await httpClient.put<UserProfile>('/users/me/settings', body)
    return data
  },

  async uploadAvatar(file: File): Promise<UserProfile> {
    const form = new FormData()
    form.append('file', file)
    const { data } = await httpClient.post<UserProfile>('/users/me/avatar', form)
    return data
  },

  async deleteAvatar(): Promise<UserProfile> {
    const { data } = await httpClient.delete<UserProfile>('/users/me/avatar')
    return data
  },

  async exportMyData(): Promise<UserDataExport> {
    const { data } = await httpClient.get<UserDataExport>('/users/me/export')
    return data
  },
}
