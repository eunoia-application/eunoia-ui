import { Button, Card, Flex, theme, Typography } from 'antd'
import { Leaf } from 'lucide-react'

import {
  MASTERY_META,
  MASTERY_ORDER,
  resolveStatus,
  useMasteryStore,
} from '@entities/mastery'
import { groupByTopic, POS_SHORT } from '@entities/word'
import type { ApiError, RequestStatus, WordLeaf } from '@shared/api'
import { brand } from '@shared/theme'
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

/** Слова блока карточками, сгруппированные по темам (сироты → «Разное»). */
export function WordList({ words, total, status, error, onOpen, onLoadMore, onRetry }: Props) {
  const { token } = theme.useToken()
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
              {group.words.map((leaf) => {
                const leafStatus = resolveStatus(leaf.id, leaf.status, byId)
                const { color } = MASTERY_META[leafStatus]
                const meta = [
                  leaf.pos?.length ? leaf.pos.map((p) => POS_SHORT[p]).join(', ') : null,
                  leaf.cefr,
                ]
                  .filter(Boolean)
                  .join(' · ')
                return (
                  <button
                    key={leaf.id}
                    type="button"
                    className="eunoia-word-card"
                    onClick={() => onOpen(leaf.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      textAlign: 'left',
                      padding: '11px 13px',
                      borderRadius: 12,
                      cursor: 'pointer',
                      font: 'inherit',
                      color: 'inherit',
                      background: token.colorFillQuaternary,
                      border: `1px solid ${token.colorBorderSecondary}`,
                      borderLeft: `3px solid ${color}`,
                    }}
                  >
                    <Flex align="center" justify="space-between" gap={8}>
                      <span style={{ fontWeight: 600 }}>{leaf.lemma}</span>
                      <Leaf size={13} color={color} />
                    </Flex>
                    {meta ? (
                      <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                        {meta}
                      </Typography.Text>
                    ) : null}
                  </button>
                )
              })}
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
