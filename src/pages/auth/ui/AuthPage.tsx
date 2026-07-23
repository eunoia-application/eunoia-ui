import { Flex } from 'antd'

import { ThemeToggle } from '@features/theme-toggle'
import { GardenBackground } from '@shared/ui'
import { AuthCard } from '@widgets/auth-card'

/** Страница авторизации: сад на фоне + плавающая карточка. */
export function AuthPage() {
  return (
    <>
      <GardenBackground />
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 3 }}>
        <ThemeToggle />
      </div>
      <Flex
        align="center"
        justify="center"
        style={{
          position: 'relative',
          zIndex: 2,
          minHeight: '100vh',
          padding: 24,
        }}
      >
        <AuthCard />
      </Flex>
    </>
  )
}
