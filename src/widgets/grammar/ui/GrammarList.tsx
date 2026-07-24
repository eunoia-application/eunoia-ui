import { Card, Flex, Tag, Typography } from 'antd'
import { SpellCheck } from 'lucide-react'

import { groupByCefr } from '@entities/grammar'
import type { ApiError, GrammarView, RequestStatus } from '@shared/api'
import { brand } from '@shared/theme'
import { EmptyState, ErrorRetry, ListSkeleton } from '@shared/ui'

interface Props {
  rules: GrammarView[]
  status: RequestStatus
  error: ApiError | null
  activeId: string | null
  onOpen: (id: string) => void
  onRetry: () => void
}

/** Ствол сада: правила грамматики, сгруппированные по уровню CEFR. */
export function GrammarList({ rules, status, error, activeId, onOpen, onRetry }: Props) {
  if (status === 'loading' && !rules.length) return <ListSkeleton count={2} rows={2} />
  if (status === 'error' && !rules.length) {
    return <ErrorRetry error={error} onRetry={onRetry} title="Не удалось загрузить ствол" />
  }
  if (!rules.length) {
    return (
      <Card variant="borderless">
        <EmptyState
          icon={<SpellCheck size={40} color={brand.primary} strokeWidth={1.5} />}
          title="Правил пока нет"
          description="Как только ствол наполнится, конструкции появятся здесь по уровням."
        />
      </Card>
    )
  }

  return (
    <Flex vertical gap={24}>
      {groupByCefr(rules).map((group) => (
        <div key={group.cefr}>
          <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
            <Tag color="green" style={{ margin: 0 }}>
              {group.cefr === 'OTHER' ? 'Без уровня' : group.cefr}
            </Tag>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {group.rules.length} правил
            </Typography.Text>
          </Flex>

          <Flex wrap gap={10}>
            {group.rules.map((rule) => {
              const active = rule.id === activeId
              return (
                <Card
                  key={rule.id}
                  size="small"
                  hoverable
                  onClick={() => onOpen(rule.id)}
                  style={{
                    width: 220,
                    borderColor: active ? brand.primary : undefined,
                  }}
                >
                  <Flex align="center" gap={8}>
                    <SpellCheck size={16} color={brand.primary} />
                    <Typography.Text strong>{rule.name}</Typography.Text>
                  </Flex>
                  {rule.prerequisites?.length ? (
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      сначала: {rule.prerequisites.length}
                    </Typography.Text>
                  ) : null}
                </Card>
              )
            })}
          </Flex>
        </div>
      ))}
    </Flex>
  )
}
