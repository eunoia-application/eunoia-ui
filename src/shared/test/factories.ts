import type {
  AuthResponse,
  AuthUser,
  UserProfile,
  UserSettings,
} from '@shared/api'

/**
 * Фабрики тестовых данных. Только для *.test.* — в прод-бандл не попадают
 * (не импортятся из прод-кода, tree-shaken).
 */

export function makeAuthUser(over: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 'u-1',
    email: 'user@example.com',
    username: 'eunoia_user',
    emailVerified: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    ...over,
  }
}

export function makeSettings(over: Partial<UserSettings> = {}): UserSettings {
  return {
    theme: 'AUTO',
    interfaceLanguage: 'ru',
    profileVisibility: 'PRIVATE',
    emailNotifications: true,
    aiSuggestionsEnabled: true,
    ...over,
  }
}

export function makeProfile(over: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 'u-1',
    email: 'user@example.com',
    username: 'eunoia_user',
    firstName: 'Alex',
    lastName: 'Johnson',
    avatarUrl: null,
    bio: null,
    emailVerified: true,
    settings: makeSettings(),
    stats: { lastActiveAt: '2026-06-01T00:00:00Z' },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    ...over,
  }
}

export function makeAuthResponse(over: Partial<AuthResponse> = {}): AuthResponse {
  return {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: makeAuthUser(),
    ...over,
  }
}
