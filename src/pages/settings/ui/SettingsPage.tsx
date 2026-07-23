import { Card, Col, Flex, Row } from 'antd'
import { useEffect } from 'react'

import { useUserStore } from '@entities/user'
import { ChangePasswordForm } from '@features/change-password'
import { ThemeToggle } from '@features/theme-toggle'
import { ProfileForm } from '@features/update-profile'
import { ErrorRetry, FormSkeleton, PageHeader } from '@shared/ui'

/**
 * Настройки аккаунта. Страница владеет загрузкой профиля (skeleton/retry),
 * а редактирование/смена пароля — отдельные features.
 */
export function SettingsPage() {
  const status = useUserStore((state) => state.status)
  const error = useUserStore((state) => state.error)
  const profile = useUserStore((state) => state.profile)
  const fetchProfile = useUserStore((state) => state.fetchProfile)

  useEffect(() => {
    if (!profile) void fetchProfile()
  }, [profile, fetchProfile])

  const renderBody = () => {
    if (status === 'loading' && !profile) {
      return (
        <Card variant="borderless">
          <FormSkeleton fields={5} />
        </Card>
      )
    }
    if (status === 'error' && !profile) {
      return <ErrorRetry error={error} onRetry={() => void fetchProfile()} />
    }
    return (
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card title="Профиль" variant="borderless">
            <ProfileForm />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Flex vertical gap={24}>
            <Card title="Безопасность" variant="borderless">
              <ChangePasswordForm />
            </Card>
            <Card title="Внешний вид" variant="borderless">
              <ThemeToggle />
            </Card>
          </Flex>
        </Col>
      </Row>
    )
  }

  return (
    <>
      <PageHeader
        title="Настройки"
        description="Управляйте профилем и параметрами аккаунта."
      />
      {renderBody()}
    </>
  )
}
