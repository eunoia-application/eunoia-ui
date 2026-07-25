import { Button, Card, Flex, Typography } from 'antd'
import { Leaf } from 'lucide-react'

import {
  MASTERY_META,
  MASTERY_ORDER,
  resolveStatus,
  useMasteryStore,
} from '@entities/mastery'
import { groupByTopic, leafMeta } from '@entities/word'
import type { ApiError, RequestStatus, WordLeaf } from '@shared/api'
import { brand } from '@shared/theme'
import { CardSkeleton, EmptyState, ErrorRetry, WordCard } from '@shared/ui'

interface Props {
  words: WordLeaf[]
  total: number
  status: RequestStatus
  error: ApiError | null
  onOpen: (id: string) => void
  onLoadMore: () => void
  onRetry: () => void
}

/** Слова блока карточками, сгруппированные по темам (сироты → «Разное»). */
export function WordList({ words, total, status, error, onOpen, onLoadMore, onRetry }: Props) {
  const byId = useMasteryStore((state) => state.byId)

  if (status === 'loading' && !words.length) return <CardSkeleton rows={4} />
  if (status === 'error' && !words.length) {
    return <ErrorRetry error={error} onRetry={onRetry} title="Не удалось загрузить слова" />
  }
  if (!words.length) {
    return (
      <Card variant="borderless">
        <EmptyState
          icon={<Leaf size={40} color={MASTERY_META.UNKNOWN.color} strokeWidth={1.5} />}
          title="В блоке пока нет слов"
        />
      </Card>
    )
  }

  const groups = groupByTopic(words)
  const hasMore = words.length < total

  return (
    <Card variant="borderless">
      <Flex vertical gap={24}>
        {groups.map((group) => (
          <div key={group.name}>
            <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
              <Leaf size={15} color={brand.primary} />
              <Typography.Text strong>{group.name}</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {group.words.length}
              </Typography.Text>
            </Flex>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: 10,
              }}
            >
              {group.words.map((leaf) => (
                <WordCard
                  key={leaf.id}
                  leaf={leaf}
                  color={MASTERY_META[resolveStatus(leaf.id, leaf.status, byId)].color}
                  meta={leafMeta(leaf)}
                  onOpen={onOpen}
                />
              ))}
            </div>
          </div>
        ))}

        <Flex align="center" justify="space-between" wrap gap={12}>
          <Flex gap={16} wrap>
            {MASTERY_ORDER.map((value) => (
              <Flex key={value} align="center" gap={6}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: MASTERY_META[value].color,
                  }}
                />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {MASTERY_META[value].label}
                </Typography.Text>
              </Flex>
            ))}
          </Flex>
          {hasMore ? (
            <Button onClick={onLoadMore} loading={status === 'loading'}>
              Показать ещё
            </Button>
          ) : null}
        </Flex>
      </Flex>
    </Card>
  )
}
