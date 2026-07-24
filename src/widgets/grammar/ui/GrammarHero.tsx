import { Card, Flex, Tag, theme, Typography } from 'antd'
import { SpellCheck } from 'lucide-react'

import { groupByCefr } from '@entities/grammar'
import type { GrammarView, RequestStatus } from '@shared/api'
import { brand } from '@shared/theme'
import { CardSkeleton } from '@shared/ui'

interface Props {
  rules: GrammarView[]
  status: RequestStatus
}

/** Обзор ствола: сколько правил и как они распределены по уровням CEFR. */
export function GrammarHero({ rules, status }: Props) {
  const { token } = theme.useToken()

  if (status === 'loading' && !rules.length) return <CardSkeleton rows={2} />
  if (!rules.length) return null

  const groups = groupByCefr(rules)

  return (
    <Card
      variant="borderless"
      styles={{ body: { padding: 28 } }}
      style={{
        background: `linear-gradient(135deg, ${brand.primarySoft}, transparent 70%)`,
      }}
    >
      <Flex align="center" gap={28} wrap>
        <span
          style={{
            flexShrink: 0,
            width: 88,
            height: 88,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 24,
            background: brand.primarySoft,
          }}
        >
          <SpellCheck size={40} color={brand.primary} />
        </span>

        <Flex vertical gap={12} style={{ flex: 1, minWidth: 220 }}>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Ствол грамматики
            </Typography.Title>
            <Typography.Text type="secondary">
              <Typography.Text strong style={{ color: token.colorText }}>
                {rules.length}
              </Typography.Text>{' '}
              правил — от простого к сложному
            </Typography.Text>
          </div>

          <Flex gap={8} wrap>
            {groups.map((group) => (
              <Tag key={group.cefr} color="green" style={{ margin: 0 }}>
                {group.cefr === 'OTHER' ? 'Без уровня' : group.cefr}: {group.rules.length}
              </Tag>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </Card>
  )
}
