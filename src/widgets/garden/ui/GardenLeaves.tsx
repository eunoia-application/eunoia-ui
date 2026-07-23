import { Card, Flex, Typography } from 'antd'
import { Leaf } from 'lucide-react'

import {
  MASTERY_META,
  MASTERY_ORDER,
  resolveStatus,
  useMasteryStore,
} from '@entities/mastery'
import type { ApiError, RequestStatus, TopicView } from '@shared/api'
import { CardSkeleton, EmptyState, ErrorRetry } from '@shared/ui'

interface Props {
  view: TopicView | null
  status: RequestStatus
  error: ApiError | null
  onOpen: (lexemeId: string) => void
  onRetry: () => void
}

/** Листья ветки: слова, окрашенные по статусу владения. */
export function GardenLeaves({ view, status, error, onOpen, onRetry }: Props) {
  const byId = useMasteryStore((state) => state.byId)

  if (status === 'loading' && !view) return <CardSkeleton rows={4} />
  if (status === 'error' && !view) {
    return <ErrorRetry error={error} onRetry={onRetry} title="Не удалось раскрыть ветку" />
  }
  if (!view) return null

  const leaves = view.lexemes ?? []

  return (
    <Card title={view.topic.name} variant="borderless">
      {leaves.length === 0 ? (
        <EmptyState
          icon={<Leaf size={40} color={MASTERY_META.UNKNOWN.color} strokeWidth={1.5} />}
          title="На этой ветке пока нет листьев"
          description="Слова появятся, когда тема наполнится."
        />
      ) : (
        <Flex vertical gap={16}>
          <Flex wrap gap={8}>
            {leaves.map((leaf) => {
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
                  {leaf.cefr ? (
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {leaf.cefr}
                    </Typography.Text>
                  ) : null}
                </button>
              )
            })}
          </Flex>

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
        </Flex>
      )}
    </Card>
  )
}
