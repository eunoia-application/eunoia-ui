/** Минимальный набор полей для отображения имени (подходит и AuthUser, и UserProfile). */
export interface NamedUser {
  firstName?: string | null
  lastName?: string | null
  username: string
  email: string
}

/** Имя для отображения: полное → username → email. */
export function displayName(user?: NamedUser | null): string {
  if (!user) return ''
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ')
  return full || user.username || user.email
}

/** Инициалы для аватара-заглушки. */
export function initials(user?: NamedUser | null): string {
  if (!user) return '?'
  const first = user.firstName?.[0] ?? user.username?.[0] ?? user.email?.[0] ?? '?'
  const second = user.lastName?.[0] ?? ''
  return (first + second).toUpperCase()
}
