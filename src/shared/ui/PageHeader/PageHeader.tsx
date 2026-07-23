import { Flex, Typography } from 'antd'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  extra?: ReactNode
}

/** Шапка страницы: заголовок + подпись слева, действия справа. */
export function PageHeader({ title, description, extra }: PageHeaderProps) {
  return (
    <Flex
      justify="space-between"
      align="flex-start"
      gap={16}
      wrap
      style={{ marginBottom: 24 }}
    >
      <Flex vertical gap={4}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        {description ? (
          <Typography.Text type="secondary">{description}</Typography.Text>
        ) : null}
      </Flex>
      {extra ? <div>{extra}</div> : null}
    </Flex>
  )
}
