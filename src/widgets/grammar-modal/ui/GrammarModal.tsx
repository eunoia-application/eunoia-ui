import { Flex, Modal, Tag, theme, Typography } from 'antd'
import { SpellCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useMemo } from 'react'

import { useGrammarStore } from '@entities/grammar'
import { POS_SHORT } from '@entities/word'
import { brand } from '@shared/theme'
import { ErrorRetry, FormSkeleton } from '@shared/ui'

interface Props {
  ruleId: string | null
  onClose: () => void
  /** Переход к правилу-предпосылке. */
  onOpenRule: (id: string) => void
  /** Открыть слово-пример в карточке слова. */
  onOpenWord: (id: string) => void
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { token } = theme.useToken()
  return (
    <div>
      <Typography.Text
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: token.colorTextTertiary,
        }}
      >
        {title}
      </Typography.Text>
      <div style={{ marginTop: 10 }}>{children}</div>
    </div>
  )
}

/** Правило грамматики: премиум-модалка с предпосылками и словами-примерами. */
export function GrammarModal({ ruleId, onClose, onOpenRule, onOpenWord }: Props) {
  const { token } = theme.useToken()
  const rule = useGrammarStore((state) => state.rule)
  const status = useGrammarStore((state) => state.ruleStatus)
  const error = useGrammarStore((state) => state.ruleError)
  const rules = useGrammarStore((state) => state.rules)
  const fetchRule = useGrammarStore((state) => state.fetchRule)
  const clearRule = useGrammarStore((state) => state.clearRule)

  // Имена предпосылок берём из уже загруженного ствола; чего нет — покажем id.
  const nameById = useMemo(() => {
    const map: Record<string, string> = {}
    for (const item of rules) map[item.id] = item.name
    return map
  }, [rules])

  useEffect(() => {
    if (ruleId) void fetchRule(ruleId)
    else clearRule()
  }, [ruleId, fetchRule, clearRule])

  const renderContent = () => {
    if (status === 'loading') {
      return (
        <div style={{ padding: '28px 28px 32px' }}>
          <FormSkeleton fields={3} />
        </div>
      )
    }
    if (status === 'error') {
      return (
        <div style={{ padding: '16px 28px 28px' }}>
          <ErrorRetry
            error={error}
            onRetry={() => ruleId && void fetchRule(ruleId)}
            title="Не удалось открыть правило"
          />
        </div>
      )
    }
    if (!rule) return null

    return (
      <>
        <div
          style={{
            padding: '30px 28px 22px',
            background: `linear-gradient(135deg, ${brand.primarySoft}, transparent 70%)`,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Flex align="center" gap={16}>
            <span
              style={{
                flexShrink: 0,
                width: 52,
                height: 52,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 16,
                background: brand.primarySoft,
              }}
            >
              <SpellCheck size={26} color={brand.primary} />
            </span>
            <div style={{ minWidth: 0 }}>
              <Typography.Title level={3} style={{ margin: 0, lineHeight: 1.15 }}>
                {rule.name}
              </Typography.Title>
              {rule.cefr ? (
                <Tag color="green" style={{ margin: '10px 0 0' }}>
                  {rule.cefr}
                </Tag>
              ) : null}
            </div>
          </Flex>
        </div>

        <Flex vertical gap={24} style={{ padding: '24px 28px 32px' }}>
          {rule.prerequisites?.length ? (
            <Section title="Сначала изучите">
              <Flex wrap gap={8}>
                {rule.prerequisites.map((id) => (
                  <Tag
                    key={id}
                    style={{ cursor: 'pointer', margin: 0, padding: '4px 12px', borderRadius: 8 }}
                    onClick={() => onOpenRule(id)}
                  >
                    {nameById[id] ?? id}
                  </Tag>
                ))}
              </Flex>
            </Section>
          ) : null}

          {rule.illustratedBy?.length ? (
            <Section title="Слова-примеры">
              <Flex wrap gap={8}>
                {rule.illustratedBy.map((ref) => (
                  <Tag
                    key={ref.id}
                    style={{ cursor: 'pointer', margin: 0, padding: '4px 12px', borderRadius: 8 }}
                    onClick={() => onOpenWord(ref.id)}
                  >
                    <span>{ref.lemma}</span>
                    {ref.pos ? (
                      <Typography.Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>
                        {POS_SHORT[ref.pos]}
                      </Typography.Text>
                    ) : null}
                  </Tag>
                ))}
              </Flex>
            </Section>
          ) : (
            <Typography.Text type="secondary">
              Примеры для этого правила пока не привязаны.
            </Typography.Text>
          )}
        </Flex>
      </>
    )
  }

  return (
    <Modal
      open={Boolean(ruleId)}
      onCancel={onClose}
      footer={null}
      centered
      width={520}
      destroyOnHidden
      title={null}
      styles={{ body: { padding: 0 }, content: { padding: 0, overflow: 'hidden' } }}
    >
      {renderContent()}
    </Modal>
  )
}
