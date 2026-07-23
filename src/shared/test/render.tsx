import { App as AntdApp, ConfigProvider } from 'antd'
import type { ReactElement, ReactNode } from 'react'
import { render } from '@testing-library/react'
import type { RenderOptions, RenderResult } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

interface ProviderOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Начальный маршрут MemoryRouter. */
  route?: string
}

/**
 * Рендер компонента со всеми провайдерами приложения: тема (ConfigProvider),
 * контекст нотификаций/модалок (antd App) и роутер (MemoryRouter).
 */
export function renderWithProviders(
  ui: ReactElement,
  options: ProviderOptions = {},
): RenderResult {
  const { route = '/', ...rest } = options

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ConfigProvider>
        <AntdApp>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </AntdApp>
      </ConfigProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...rest })
}
