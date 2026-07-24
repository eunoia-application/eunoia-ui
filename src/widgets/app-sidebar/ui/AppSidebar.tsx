import { Button, Flex, Layout, Popover, theme, Tooltip, Typography } from 'antd'
import {
  ChevronsLeft,
  ChevronsRight,
  Leaf,
  LogOut,
  Settings,
  SpellCheck,
  Sprout,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useSessionStore } from '@entities/session'
import { displayName, UserAvatar, useUserStore } from '@entities/user'
import { useLogout } from '@features/auth-logout'
import logoUrl from '@shared/assets/logo.png'
import { APP, PATHS } from '@shared/config'
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

/** Боковая навигация: лого, карточка пользователя, разделы, садовый футер. */
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

  const rowStyle = { padding: '9px 12px', borderRadius: 10, cursor: 'pointer' } as const

  const profileMenu = (
    <div style={{ width: 244 }}>
      <Flex align="center" gap={12} style={{ padding: '14px 14px 12px' }}>
        <UserAvatar user={user} size={42} />
        <div style={{ minWidth: 0 }}>
          <Typography.Text strong ellipsis style={{ display: 'block' }}>
            {displayName(user)}
          </Typography.Text>
          {user?.email ? (
            <Typography.Text
              type="secondary"
              ellipsis
              style={{ display: 'block', fontSize: 12 }}
            >
              {user.email}
            </Typography.Text>
          ) : null}
        </div>
      </Flex>

      <div style={{ height: 1, background: token.colorBorderSecondary, margin: '0 8px 6px' }} />

      <div style={{ padding: '0 6px 6px' }}>
        <Flex
          align="center"
          gap={10}
          className="eunoia-menu-row"
          style={{ ...rowStyle, color: token.colorText }}
          onClick={() => {
            setMenuOpen(false)
            navigate(PATHS.settings)
          }}
        >
          <Settings size={16} />
          <span style={{ fontWeight: 500 }}>Настройки</span>
        </Flex>
        <Flex
          align="center"
          gap={10}
          className="eunoia-menu-row eunoia-menu-row--danger"
          style={{ ...rowStyle, color: token.colorError }}
          onClick={() => {
            setMenuOpen(false)
            void logout()
          }}
        >
          <LogOut size={16} />
          <span style={{ fontWeight: 500 }}>Выйти</span>
        </Flex>
      </div>
    </div>
  )

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      trigger={null}
      breakpoint="lg"
      collapsedWidth={72}
      width={248}
      theme={resolved}
      style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'auto' }}
    >
      <Flex vertical style={{ height: '100%' }}>
        <Flex align="center" justify="center" gap={10} style={{ height: 68 }}>
          <img
            src={logoUrl}
            alt={APP.name}
            width={38}
            height={38}
            style={{ objectFit: 'contain' }}
          />
          {!collapsed && (
            <Typography.Text strong style={{ fontSize: 19, letterSpacing: '-0.02em' }}>
              {APP.name}
            </Typography.Text>
          )}
        </Flex>

        <Popover
          open={menuOpen}
          onOpenChange={setMenuOpen}
          trigger="click"
          placement="rightTop"
          styles={{ body: { padding: 6, borderRadius: 14 } }}
          content={profileMenu}
        >
          <Flex
            vertical
            align="center"
            gap={10}
            style={{
              padding: collapsed ? '12px 0' : '16px 12px',
              margin: collapsed ? 8 : '4px 12px 8px',
              borderRadius: 16,
              cursor: 'pointer',
              background: brand.primarySoft,
            }}
          >
            <div
              style={{
                padding: 3,
                borderRadius: '50%',
                background: token.colorBgContainer,
                boxShadow: `0 0 0 2px ${brand.primary}`,
              }}
            >
              <UserAvatar user={user} size={collapsed ? 36 : 52} />
            </div>
            {!collapsed && (
              <Flex vertical align="center" gap={2} style={{ width: '100%' }}>
                <Typography.Text strong ellipsis style={{ width: '100%', textAlign: 'center' }}>
                  {displayName(user)}
                </Typography.Text>
                {user?.email ? (
                  <Typography.Text
                    type="secondary"
                    ellipsis
                    style={{ width: '100%', textAlign: 'center', fontSize: 12 }}
                  >
                    {user.email}
                  </Typography.Text>
                ) : null}
              </Flex>
            )}
          </Flex>
        </Popover>

        {!collapsed && (
          <Typography.Text
            style={{
              padding: '10px 18px 6px',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: token.colorTextTertiary,
            }}
          >
            Разделы
          </Typography.Text>
        )}

        <Flex vertical gap={4} style={{ flex: 1, padding: '0 10px' }}>
          {NAV.map((item) => {
            const active = location.pathname === item.to
            return (
              <Tooltip
                key={item.to}
                title={collapsed ? item.label : undefined}
                placement="right"
              >
                <Flex
                  className={`eunoia-nav-item${active ? ' eunoia-nav-item--active' : ''}`}
                  align="center"
                  justify={collapsed ? 'center' : 'flex-start'}
                  gap={12}
                  onClick={() => navigate(item.to)}
                  style={{
                    height: 46,
                    padding: collapsed ? 0 : '0 14px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontWeight: active ? 600 : 500,
                    color: active ? token.colorPrimary : token.colorText,
                    background: active ? brand.primarySoft : 'transparent',
                    boxShadow: active ? `inset 3px 0 0 ${token.colorPrimary}` : 'none',
                  }}
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </Flex>
              </Tooltip>
            )
          })}
        </Flex>

        <div style={{ height: 1, background: token.colorBorderSecondary, margin: '8px 14px' }} />
        {collapsed ? (
          <Flex justify="center" style={{ paddingBottom: 12 }}>
            <Tooltip title="Развернуть меню" placement="right">
              <Button
                type="text"
                aria-label="Развернуть меню"
                icon={<ChevronsRight size={18} />}
                onClick={() => onCollapse(false)}
              />
            </Tooltip>
          </Flex>
        ) : (
          <Flex align="center" justify="space-between" style={{ padding: '0 10px 12px 16px' }}>
            <Flex align="center" gap={8}>
              <Sprout size={15} color={brand.primary} />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                v{APP.version}
              </Typography.Text>
            </Flex>
            <Button
              type="text"
              size="small"
              aria-label="Свернуть меню"
              icon={<ChevronsLeft size={18} />}
              onClick={() => onCollapse(true)}
            />
          </Flex>
        )}
      </Flex>
    </Sider>
  )
}
