import { App as AntdApp } from 'antd'
import { BrowserRouter } from 'react-router-dom'

import { AppRoutes } from '@app/router'

import { NotifyBridge } from './NotifyBridge'
import { ThemeProvider } from './ThemeProvider'

/** Корневая композиция провайдеров приложения. */
export function AppProviders() {
  return (
    <ThemeProvider>
      <AntdApp
        notification={{
          placement: 'bottomRight',
          showProgress: true,
          pauseOnHover: true,
        }}
      >
        <NotifyBridge />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AntdApp>
    </ThemeProvider>
  )
}
