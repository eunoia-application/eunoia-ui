import { Layout } from 'antd'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { AppSidebar } from '@widgets/app-sidebar'
import { AppTopbar } from '@widgets/app-topbar'

const { Content } = Layout

/** Оболочка авторизованной части: сайдбар + топбар + контент. */
export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppSidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout>
        <AppTopbar />
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
