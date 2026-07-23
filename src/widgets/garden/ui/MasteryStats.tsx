import { Card, Col, Row, Statistic } from 'antd'
import { Leaf } from 'lucide-react'
import { useMemo } from 'react'

import { MASTERY_META, MASTERY_ORDER, useMasteryStore } from '@entities/mastery'
import type { MasteryStatus } from '@shared/api'
import { CardSkeleton } from '@shared/ui'

/** Сколько листьев какого цвета — по моим отметкам из /learning/mastery. */
export function MasteryStats() {
  const byId = useMasteryStore((state) => state.byId)
  const status = useMasteryStore((state) => state.status)

  const counts = useMemo(() => {
    const acc: Record<MasteryStatus, number> = { KNOWN: 0, LEARNING: 0, UNKNOWN: 0 }
    for (const value of Object.values(byId)) acc[value] += 1
    return acc
  }, [byId])

  const total = MASTERY_ORDER.reduce((sum, value) => sum + counts[value], 0)

  if (status === 'loading' && total === 0) return <CardSkeleton rows={1} />
  // Прогресс — вспомогательный блок: если не загрузился, страницу не шумим,
  // листья всё равно раскрашены серверными статусами.
  if (status === 'error' && total === 0) return null

  return (
    <Row gutter={[16, 16]}>
      {MASTERY_ORDER.map((value) => (
        <Col xs={24} sm={8} key={value}>
          <Card variant="borderless">
            <Statistic
              title={MASTERY_META[value].label}
              value={counts[value]}
              prefix={<Leaf size={18} color={MASTERY_META[value].color} />}
            />
          </Card>
        </Col>
      ))}
    </Row>
  )
}
