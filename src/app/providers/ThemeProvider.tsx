import { ConfigProvider } from 'antd'
import ruRU from 'antd/locale/ru_RU'
import { useEffect } from 'react'
import type { ReactNode } from 'react'

import { darkTheme, lightTheme, useResolvedTheme } from '@shared/theme'

/** Подаёт токены темы в AntD и синхронизирует color-scheme документа. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const resolved = useResolvedTheme()
  const config = resolved === 'dark' ? darkTheme : lightTheme

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = resolved
    root.style.colorScheme = resolved
  }, [resolved])

  return (
    <ConfigProvider theme={config} locale={ruRU}>
      {children}
    </ConfigProvider>
  )
}
