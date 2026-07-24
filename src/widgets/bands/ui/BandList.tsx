import { Card, Flex, theme, Typography } from 'antd'
import { Layers } from 'lucide-react'

import { MASTERY_META } from '@entities/mastery'
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

/** Блоки топ-слов по частотности с прогрессом «знаю / учить». */
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
    <Flex wrap gap={12}>
      {bands.map((band) => {
        const active = band.id === activeId
        const known = band.total ? (band.known / band.total) * 100 : 0
        const learning = band.total ? (band.learning / band.total) * 100 : 0
        return (
          <Card
            key={band.id}
            size="small"
            hoverable
            onClick={() => onSelect(band.id)}
            style={{ width: 232, borderColor: active ? brand.primary : undefined }}
          >
            <Flex align="center" justify="space-between">
              <Typography.Text strong>{band.label}</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {band.fromRank}–{band.toRank}
              </Typography.Text>
            </Flex>

            <div
              style={{
                height: 6,
                borderRadius: 3,
                background: token.colorFillSecondary,
                display: 'flex',
                overflow: 'hidden',
                margin: '10px 0 8px',
              }}
            >
              <div style={{ width: `${known}%`, background: MASTERY_META.KNOWN.color }} />
              <div style={{ width: `${learning}%`, background: MASTERY_META.LEARNING.color }} />
            </div>

            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {band.known} знаю · {band.learning} учить · {band.total} слов
            </Typography.Text>
          </Card>
        )
      })}
    </Flex>
  )
}
