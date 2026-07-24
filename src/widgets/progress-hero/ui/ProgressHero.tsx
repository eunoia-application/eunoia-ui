import { Card, Flex, Progress, theme, Typography } from 'antd'

import { MASTERY_META } from '@entities/mastery'
import type { Band, MasteryStatus, RequestStatus } from '@shared/api'
import { brand } from '@shared/theme'
import { CardSkeleton } from '@shared/ui'

interface Props {
  bands: Band[]
  status: RequestStatus
}

function Stat({ status, label, value }: { status: MasteryStatus; label: string; value: number }) {
  const { token } = theme.useToken()
  return (
    <Flex align="center" gap={8}>
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: MASTERY_META[status].color,
        }}
      />
      <Typography.Text strong style={{ color: token.colorText }}>
        {value}
      </Typography.Text>
      <Typography.Text type="secondary">{label}</Typography.Text>
    </Flex>
  )
}

/**
 * Обзор роста словаря: общий прогресс из блоков (сумма known/learning/total),
 * без отдельного запроса — данные уже есть в /learning/bands.
 */
export function ProgressHero({ bands, status }: Props) {
  const { token } = theme.useToken()

  if (status === 'loading' && !bands.length) return <CardSkeleton rows={2} />
  if (!bands.length) return null

  const total = bands.reduce((sum, b) => sum + b.total, 0)
  const known = bands.reduce((sum, b) => sum + b.known, 0)
  const learning = bands.reduce((sum, b) => sum + b.learning, 0)
  const pct = total ? Math.round((known / total) * 100) : 0
  const rest = Math.max(total - known - learning, 0)

  return (
    <Card
      variant="borderless"
      styles={{ body: { padding: 28 } }}
      style={{
        background: `linear-gradient(135deg, ${brand.primarySoft}, transparent 70%)`,
      }}
    >
      <Flex align="center" gap={32} wrap>
        <Progress
          type="circle"
          percent={pct}
          size={132}
          strokeColor={brand.primary}
          trailColor={token.colorFillSecondary}
          format={() => (
            <span style={{ fontSize: 26, fontWeight: 600, color: token.colorText }}>
              {pct}%
            </span>
          )}
        />

        <Flex vertical gap={12} style={{ flex: 1, minWidth: 220 }}>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Ваш словарный сад
            </Typography.Title>
            <Typography.Text type="secondary">
              Освоено{' '}
              <Typography.Text strong style={{ color: token.colorText }}>
                {known}
              </Typography.Text>{' '}
              из {total} слов
            </Typography.Text>
          </div>

          <Flex gap={24} wrap>
            <Stat status="KNOWN" label="Знаю" value={known} />
            <Stat status="LEARNING" label="Учить" value={learning} />
            <Stat status="UNKNOWN" label="Осталось" value={rest} />
          </Flex>
        </Flex>
      </Flex>
    </Card>
  )
}
