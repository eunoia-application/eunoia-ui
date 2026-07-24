import { Button, Card, Flex, Typography } from 'antd'
import { Leaf } from 'lucide-react'

import {
  MASTERY_META,
  MASTERY_ORDER,
  resolveStatus,
  useMasteryStore,
} from '@entities/mastery'
import { groupByTopic, POS_SHORT } from '@entities/word'
import type { ApiError, RequestStatus, WordLeaf } from '@shared/api'
import { CardSkeleton, EmptyState, ErrorRetry } from '@shared/ui'

interface Props {
  words: WordLeaf[]
  total: number
  status: RequestStatus
  error: ApiError | null
  onOpen: (id: string) => void
  onLoadMore: () => void
  onRetry: () => void
}

/** Слова блока, сгруппированные по темам (сироты → «Разное») + догрузка. */
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
      <Flex vertical gap={22}>
        {groups.map((group) => (
          <div key={group.name}>
            <Typography.Text
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: MASTERY_META.UNKNOWN.color,
              }}
            >
              {group.name}
            </Typography.Text>
            <Flex wrap gap={8} style={{ marginTop: 10 }}>
              {group.words.map((leaf) => {
                const leafStatus = resolveStatus(leaf.id, leaf.status, byId)
                const { color } = MASTERY_META[leafStatus]
                return (
                  <button
                    key={leaf.id}
                    type="button"
                    onClick={() => onOpen(leaf.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '7px 14px',
                      borderRadius: 999,
                      cursor: 'pointer',
                      font: 'inherit',
                      color: 'inherit',
                      background: `${color}1A`,
                      border: `1px solid ${color}55`,
                    }}
                  >
                    <Leaf size={14} color={color} />
                    <span style={{ fontWeight: 500 }}>{leaf.lemma}</span>
                    {leaf.pos?.length ? (
                      <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                        {leaf.pos.map((p) => POS_SHORT[p]).join(', ')}
                      </Typography.Text>
                    ) : null}
                  </button>
                )
              })}
            </Flex>
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
