import { Layout } from 'antd'
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'

import { useUserStore } from '@entities/user'
import { AppSidebar } from '@widgets/app-sidebar'

const { Content } = Layout

/** Оболочка авторизованной части: сайдбар (с пользователем) + контент. */
export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const profileLoaded = useUserStore((state) => state.profile !== null)
  const fetchProfile = useUserStore((state) => state.fetchProfile)

  // Подгружаем полный профиль один раз (аватар/имя в сайдбаре, синк темы).
  useEffect(() => {
    if (!profileLoaded) void fetchProfile()
  }, [profileLoaded, fetchProfile])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppSidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout>
        <Content
          style={{
            padding: 24,
            width: '100%',
            maxWidth: 1160,
            marginInline: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
