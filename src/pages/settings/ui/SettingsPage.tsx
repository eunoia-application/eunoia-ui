import { Button, Card, Col, Flex, Row, theme, Typography } from 'antd'
import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useUserStore } from '@entities/user'
import { DeleteAccountButton } from '@features/delete-account'
import { ExportDataButton } from '@features/export-data'
import { AvatarManager } from '@features/manage-avatar'
import { ThemeToggle } from '@features/theme-toggle'
import { ProfileForm } from '@features/update-profile'
import { SettingsForm } from '@features/update-settings'
import { ErrorRetry, FormSkeleton, PageHeader } from '@shared/ui'

/** Настройки аккаунта: профиль, аватар, параметры, данные, опасная зона. */
export function SettingsPage() {
  const navigate = useNavigate()
  const { token } = theme.useToken()
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
          <Flex vertical gap={24}>
            <Card title="Профиль" variant="borderless">
              <Flex vertical gap={24}>
                <AvatarManager />
                <ProfileForm />
              </Flex>
            </Card>
            <Card title="Настройки" variant="borderless">
              <SettingsForm />
            </Card>
          </Flex>
        </Col>

        <Col xs={24} lg={10}>
          <Flex vertical gap={24}>
            <Card title="Внешний вид" variant="borderless">
              <Flex vertical gap={12} align="flex-start">
                <Typography.Text type="secondary">
                  Быстрое переключение темы для этого устройства.
                </Typography.Text>
                <ThemeToggle />
              </Flex>
            </Card>

            <Card title="Данные" variant="borderless">
              <Flex vertical gap={12} align="flex-start">
                <Typography.Text type="secondary">
                  Скачайте копию своих данных в формате JSON.
                </Typography.Text>
                <ExportDataButton />
              </Flex>
            </Card>

            <Card
              title="Опасная зона"
              variant="outlined"
              style={{ borderColor: token.colorError }}
              styles={{ header: { color: token.colorError } }}
            >
              <Flex vertical gap={12} align="flex-start">
                <Typography.Text type="secondary">
                  Удаление аккаунта необратимо — профиль и данные будут стёрты.
                </Typography.Text>
                <DeleteAccountButton />
              </Flex>
            </Card>
          </Flex>
        </Col>
      </Row>
    )
  }

  return (
    <>
      <Button
        type="text"
        icon={<ArrowLeft size={16} />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 8, paddingInline: 0 }}
      >
        Назад
      </Button>
      <PageHeader
        title="Настройки"
        description="Профиль, аватар, параметры и данные аккаунта."
      />
      {renderBody()}
    </>
  )
}
