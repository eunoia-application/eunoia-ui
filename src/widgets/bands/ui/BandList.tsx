import { Card, Flex, Progress, Tag, theme, Typography } from 'antd'
import { Check, Layers } from 'lucide-react'

import type { ApiError, Band, RequestStatus } from '@shared/api'
import { brand } from '@shared/theme'
import { EmptyState, ErrorRetry, ListSkeleton } from '@shared/ui'

interface Props {
  bands: Band[]
  status: RequestStatus
  error: ApiError | null
  activeId: string | null
  onSelect: (id: string) => void
  onRetry: () => void
}

/** Блоки топ-слов по частотности: кольцевой прогресс «знаю/учить». */
export function BandList({ bands, status, error, activeId, onSelect, onRetry }: Props) {
  const { token } = theme.useToken()

  if (status === 'loading' && !bands.length) return <ListSkeleton count={2} rows={2} />
  if (status === 'error' && !bands.length) {
    return <ErrorRetry error={error} onRetry={onRetry} title="Не удалось загрузить блоки" />
  }
  if (!bands.length) {
    return (
      <Card variant="borderless">
        <EmptyState
          icon={<Layers size={40} color={brand.primary} strokeWidth={1.5} />}
          title="Блоков пока нет"
          description="Как только словарь наполнится, здесь появятся уровни по частотности."
        />
      </Card>
    )
  }

  return (
    <Flex wrap gap={14}>
      {bands.map((band) => {
        const active = band.id === activeId
        const pct = band.total ? Math.round((band.known / band.total) * 100) : 0
        const done = band.total > 0 && band.known === band.total
        return (
          <Card
            key={band.id}
            className="eunoia-band-card"
            onClick={() => onSelect(band.id)}
            styles={{ body: { padding: 18 } }}
            style={{
              width: 250,
              cursor: 'pointer',
              borderColor: active ? brand.primary : token.colorBorderSecondary,
              background: active ? brand.primarySoft : undefined,
              boxShadow: active ? `0 0 0 1px ${brand.primary}` : undefined,
            }}
          >
            <Flex justify="space-between" align="flex-start" gap={12}>
              <div style={{ minWidth: 0 }}>
                <Typography.Text strong style={{ fontSize: 15 }}>
                  {band.label}
                </Typography.Text>
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {band.fromRank}–{band.toRank}
                  </Typography.Text>
                </div>
              </div>
              <Progress
                type="circle"
                percent={pct}
                size={46}
                strokeColor={brand.primary}
                trailColor={token.colorFillSecondary}
                format={() => (
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{pct}%</span>
                )}
              />
            </Flex>

            <Flex align="center" justify="space-between" gap={8} wrap style={{ marginTop: 14 }}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {band.known} знаю · {band.learning} учить · {band.total} слов
              </Typography.Text>
              {done ? (
                <Tag color="green" style={{ margin: 0 }}>
                  <Flex align="center" gap={4}>
                    <Check size={12} />
                    Освоено
                  </Flex>
                </Tag>
              ) : null}
            </Flex>
          </Card>
        )
      })}
    </Flex>
  )
}
