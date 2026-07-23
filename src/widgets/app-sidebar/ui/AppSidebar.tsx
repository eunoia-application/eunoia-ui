import { Flex, Layout, Menu, Popover, theme, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { Leaf, LogOut, Settings, SpellCheck, Sprout } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useSessionStore } from '@entities/session'
import { displayName, UserAvatar, useUserStore } from '@entities/user'
import { useLogout } from '@features/auth-logout'
import logoUrl from '@shared/assets/logo.png'
import { PATHS } from '@shared/config'
import { brand, useResolvedTheme } from '@shared/theme'

const { Sider } = Layout

interface AppSidebarProps {
  collapsed: boolean
  onCollapse: (value: boolean) => void
}

interface NavLink {
  to: string
  icon: ReactNode
  label: string
}

const NAV: NavLink[] = [
  { to: PATHS.home, icon: <Sprout size={18} />, label: 'Сад' },
  { to: PATHS.words, icon: <Leaf size={18} />, label: 'Слова' },
  { to: PATHS.grammar, icon: <SpellCheck size={18} />, label: 'Грамматика' },
]

/** Боковая навигация: лого, пользователь (меню справа), центрированные пункты. */
export function AppSidebar({ collapsed, onCollapse }: AppSidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const resolved = useResolvedTheme()
  const logout = useLogout()
  const { token } = theme.useToken()
  const [menuOpen, setMenuOpen] = useState(false)

  const sessionUser = useSessionStore((state) => state.user)
  const profile = useUserStore((state) => state.profile)
  const user = profile ?? sessionUser

  const userMenu: MenuProps['items'] = [
    {
      key: 'settings',
      icon: <Settings size={16} />,
      label: 'Настройки',
      onClick: () => {
        setMenuOpen(false)
        navigate(PATHS.settings)
      },
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: 'Выйти',
      onClick: () => {
        setMenuOpen(false)
        void logout()
      },
    },
  ]

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      breakpoint="lg"
      collapsedWidth={72}
      width={240}
      theme={resolved}
    >
      <Flex vertical style={{ height: '100%' }}>
        <Flex align="center" justify="center" gap={10} style={{ height: 64 }}>
          <img
            src={logoUrl}
            alt="Eunoia"
            width={40}
            height={40}
            style={{ objectFit: 'contain' }}
          />
          {!collapsed && (
            <Typography.Text strong style={{ fontSize: 18, letterSpacing: '-0.02em' }}>
              Eunoia
            </Typography.Text>
          )}
        </Flex>

        <Popover
          open={menuOpen}
          onOpenChange={setMenuOpen}
          trigger="click"
          placement="rightTop"
          styles={{ body: { padding: 4 } }}
          content={
            <Menu
              mode="vertical"
              selectable={false}
              items={userMenu}
              style={{ border: 'none', minWidth: 160 }}
            />
          }
        >
          <Flex
            vertical
            align="center"
            gap={10}
            style={{
              padding: collapsed ? '12px 0' : '18px 12px',
              margin: 8,
              borderRadius: 12,
              cursor: 'pointer',
            }}
          >
            <UserAvatar user={user} size={collapsed ? 40 : 56} />
            {!collapsed && (
              <Typography.Text strong ellipsis style={{ width: '100%', textAlign: 'center' }}>
                {displayName(user)}
              </Typography.Text>
            )}
          </Flex>
        </Popover>

        <Flex vertical gap={4} style={{ flex: 1, padding: '4px 8px' }}>
          {NAV.map((item) => {
            const active = location.pathname === item.to
            return (
              <Flex
                key={item.to}
                className="eunoia-nav-item"
                align="center"
                justify="center"
                gap={8}
                onClick={() => navigate(item.to)}
                style={{
                  height: 44,
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: active ? 600 : 500,
                  color: active ? token.colorPrimary : token.colorText,
                  backgroundColor: active ? brand.primarySoft : 'transparent',
                }}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </Flex>
            )
          })}
        </Flex>
      </Flex>
    </Sider>
  )
}
