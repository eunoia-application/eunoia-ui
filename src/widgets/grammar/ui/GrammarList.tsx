import { Card, Flex, Tag, theme, Typography } from 'antd'
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

/** Ствол сада: правила грамматики карточками, сгруппированные по уровню CEFR. */
export function GrammarList({ rules, status, error, activeId, onOpen, onRetry }: Props) {
  const { token } = theme.useToken()

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
    <Card variant="borderless">
      <Flex vertical gap={24}>
        {groupByCefr(rules).map((group) => (
          <div key={group.cefr}>
            <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
              <SpellCheck size={15} color={brand.primary} />
              <Tag color="green" style={{ margin: 0 }}>
                {group.cefr === 'OTHER' ? 'Без уровня' : group.cefr}
              </Tag>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {group.rules.length}
              </Typography.Text>
            </Flex>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                gap: 10,
              }}
            >
              {group.rules.map((rule) => {
                const active = rule.id === activeId
                return (
                  <button
                    key={rule.id}
                    type="button"
                    className="eunoia-word-card"
                    onClick={() => onOpen(rule.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderRadius: 12,
                      cursor: 'pointer',
                      font: 'inherit',
                      color: 'inherit',
                      background: active ? brand.primarySoft : token.colorFillQuaternary,
                      border: `1px solid ${active ? brand.primary : token.colorBorderSecondary}`,
                      borderLeft: `3px solid ${brand.primary}`,
                    }}
                  >
                    <Flex align="center" justify="space-between" gap={8}>
                      <span style={{ fontWeight: 600 }}>{rule.name}</span>
                      <SpellCheck size={14} color={brand.primary} />
                    </Flex>
                    {rule.prerequisites?.length ? (
                      <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                        сначала: {rule.prerequisites.length}
                      </Typography.Text>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </Flex>
    </Card>
  )
}
