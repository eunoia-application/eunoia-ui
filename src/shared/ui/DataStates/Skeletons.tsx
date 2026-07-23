import { Card, Flex, Skeleton } from 'antd'

/** Скелет карточки. */
export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card variant="borderless">
      <Skeleton active paragraph={{ rows }} />
    </Card>
  )
}

/** Скелет списка карточек. */
export function ListSkeleton({ count = 4, rows = 2 }: { count?: number; rows?: number }) {
  return (
    <Flex vertical gap={16}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} rows={rows} />
      ))}
    </Flex>
  )
}

/** Скелет формы (несколько полей + кнопка). */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <Flex vertical gap={20} style={{ maxWidth: 480 }}>
      {Array.from({ length: fields }).map((_, index) => (
        <Skeleton.Input key={index} active block style={{ height: 40 }} />
      ))}
      <Skeleton.Button active style={{ width: 140 }} />
    </Flex>
  )
}
