import { Flex, Layout, Menu, Typography } from 'antd'
import { Settings, Sprout } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { PATHS } from '@shared/config'
import { brand, useResolvedTheme } from '@shared/theme'

const { Sider } = Layout

interface AppSidebarProps {
  collapsed: boolean
  onCollapse: (value: boolean) => void
}

/** Боковая навигация приложения. Разделы итерации 1: Сад и Настройки. */
export function AppSidebar({ collapsed, onCollapse }: AppSidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const resolved = useResolvedTheme()

  const items = [
    { key: PATHS.home, icon: <Sprout size={18} />, label: 'Сад' },
    { key: PATHS.settings, icon: <Settings size={18} />, label: 'Настройки' },
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
      <Flex
        align="center"
        gap={10}
        style={{
          height: 64,
          paddingInline: collapsed ? 0 : 20,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <Sprout size={22} color={brand.primary} />
        {!collapsed && (
          <Typography.Text strong style={{ fontSize: 18, letterSpacing: '-0.02em' }}>
            Eunoia
          </Typography.Text>
        )}
      </Flex>

      <Menu
        mode="inline"
        theme={resolved}
        selectedKeys={[location.pathname]}
        items={items}
        onClick={({ key }) => navigate(key)}
        style={{ borderInlineEnd: 'none', background: 'transparent' }}
      />
    </Sider>
  )
}
