import type { UserProfile } from '@shared/api'

/** Имя для отображения: полное → username → email. */
export function displayName(user?: UserProfile | null): string {
  if (!user) return ''
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ')
  return full || user.username || user.email
}

/** Инициалы для аватара-заглушки. */
export function initials(user?: UserProfile | null): string {
  if (!user) return '?'
  const first = user.firstName?.[0] ?? user.username?.[0] ?? user.email?.[0] ?? '?'
  const second = user.lastName?.[0] ?? ''
  return (first + second).toUpperCase()
}
