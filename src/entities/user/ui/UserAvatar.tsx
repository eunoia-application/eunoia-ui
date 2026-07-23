import { Avatar } from 'antd'
import type { AvatarProps } from 'antd'

import type { UserProfile } from '@shared/api'
import { brand } from '@shared/theme'

import { initials } from '../lib/displayName'

interface UserAvatarProps {
  user?: UserProfile | null
  size?: AvatarProps['size']
}

/** Аватар пользователя: картинка или инициалы на брендовом фоне. */
export function UserAvatar({ user, size = 'default' }: UserAvatarProps) {
  if (user?.avatarUrl) {
    return <Avatar src={user.avatarUrl} size={size} alt={user.username} />
  }
  return (
    <Avatar size={size} style={{ backgroundColor: brand.primary, fontWeight: 600 }}>
      {initials(user)}
    </Avatar>
  )
}
