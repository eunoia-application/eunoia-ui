import { Button, Card, Flex } from 'antd'
import { TreeDeciduous } from 'lucide-react'

import type { ApiError, RequestStatus, TopicRef } from '@shared/api'
import { brand } from '@shared/theme'
import { EmptyState, ErrorRetry, ListSkeleton } from '@shared/ui'

interface Props {
  roots: TopicRef[]
  status: RequestStatus
  error: ApiError | null
  activeId: string | null
  onSelect: (id: string) => void
  onRetry: () => void
}

/** Ветки сада — корневые темы. Контракт отдаёт только верхний уровень. */
export function GardenBranches({
  roots,
  status,
  error,
  activeId,
  onSelect,
  onRetry,
}: Props) {
  if (status === 'loading' && !roots.length) {
    return <ListSkeleton count={1} rows={1} />
  }

  if (status === 'error' && !roots.length) {
    return <ErrorRetry error={error} onRetry={onRetry} title="Не удалось загрузить ветки" />
  }

  if (!roots.length) {
    return (
      <Card variant="borderless">
        <EmptyState
          icon={<TreeDeciduous size={40} color={brand.primary} strokeWidth={1.5} />}
          title="Веток пока нет"
          description="Как только в саду появятся темы, они прорастут здесь."
        />
      </Card>
    )
  }

  return (
    <Flex wrap gap={10}>
      {roots.map((topic) => (
        <Button
          key={topic.id}
          type={topic.id === activeId ? 'primary' : 'default'}
          shape="round"
          icon={<TreeDeciduous size={15} />}
          onClick={() => onSelect(topic.id)}
        >
          {topic.name}
        </Button>
      ))}
    </Flex>
  )
}
