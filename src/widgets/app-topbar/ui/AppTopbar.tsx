import { Dropdown, Flex, Layout, theme, Typography } from 'antd'
import { LogOut } from 'lucide-react'

import { useSessionStore } from '@entities/session'
import { displayName, UserAvatar, useUserStore } from '@entities/user'
import { useLogout } from '@features/auth-logout'
import { ThemeToggle } from '@features/theme-toggle'

const { Header } = Layout

/** Верхняя панель: переключатель темы + меню пользователя. */
export function AppTopbar() {
  const { token } = theme.useToken()
  const sessionUser = useSessionStore((state) => state.user)
  const profile = useUserStore((state) => state.profile)
  // Полный профиль (с аватаром) приоритетнее слим-идентичности сессии.
  const user = profile ?? sessionUser
  const logout = useLogout()

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 16,
        paddingInline: 20,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <ThemeToggle />

      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            {
              key: 'logout',
              icon: <LogOut size={16} />,
              label: 'Выйти',
              onClick: () => void logout(),
            },
          ],
        }}
      >
        <Flex align="center" gap={8} style={{ cursor: 'pointer' }}>
          <UserAvatar user={user} size={32} />
          <Typography.Text strong>{displayName(user)}</Typography.Text>
        </Flex>
      </Dropdown>
    </Header>
  )
}
