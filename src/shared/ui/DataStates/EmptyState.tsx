import { Button, Empty, Flex, Typography } from 'antd'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  action?: { label: string; onClick: () => void }
}

/** Пустое состояние списка/раздела — единый вид на всё приложение. */
export function EmptyState({
  title = 'Пока пусто',
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <Flex
      vertical
      align="center"
      justify="center"
      gap={12}
      style={{ padding: '48px 24px', textAlign: 'center' }}
    >
      {icon ?? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />}
      <Typography.Title level={5} style={{ margin: 0 }}>
        {title}
      </Typography.Title>
      {description ? (
        <Typography.Text type="secondary" style={{ maxWidth: 360 }}>
          {description}
        </Typography.Text>
      ) : null}
      {action ? (
        <Button type="primary" onClick={action.onClick} style={{ marginTop: 8 }}>
          {action.label}
        </Button>
      ) : null}
    </Flex>
  )
}
