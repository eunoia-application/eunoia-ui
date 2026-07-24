import { Flex, Modal, Tag, theme, Typography } from 'antd'
import { Leaf } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

import { MASTERY_META, resolveStatus, useMasteryStore } from '@entities/mastery'
import { POS_LABEL, POS_SHORT, useWordStore } from '@entities/word'
import { MasteryControl } from '@features/set-mastery'
import type { WordRef, WordVariant } from '@shared/api'
import { brand } from '@shared/theme'
import { ErrorRetry, FormSkeleton } from '@shared/ui'

interface Props {
  wordId: string | null
  onClose: () => void
  /** Переход по связи графа — открывает карточку соседнего слова. */
  onOpen: (wordId: string) => void
}

function Label({ children }: { children: ReactNode }) {
  const { token } = theme.useToken()
  return (
    <Typography.Text
      style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: token.colorTextTertiary,
      }}
    >
      {children}
    </Typography.Text>
  )
}

function RefList({
  title,
  refs,
  onOpen,
}: {
  title: string
  refs?: WordRef[]
  onOpen: (id: string) => void
}) {
  if (!refs?.length) return null
  return (
    <div>
      <Label>{title}</Label>
      <Flex wrap gap={8} style={{ marginTop: 8 }}>
        {refs.map((ref) => (
          <Tag
            key={ref.id}
            style={{ cursor: 'pointer', margin: 0, padding: '4px 12px', borderRadius: 8 }}
            onClick={() => onOpen(ref.id)}
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
    </div>
  )
}

function VariantBlock({
  variant,
  onOpen,
}: {
  variant: WordVariant
  onOpen: (id: string) => void
}) {
  const { token } = theme.useToken()
  return (
    <Flex vertical gap={16}>
      <Flex align="center" gap={8} wrap>
        <Typography.Text strong style={{ fontSize: 15, textTransform: 'capitalize' }}>
          {POS_LABEL[variant.pos]}
        </Typography.Text>
        {variant.cefr ? (
          <Tag color="green" style={{ margin: 0 }}>
            {variant.cefr}
          </Tag>
        ) : null}
        {typeof variant.freqRank === 'number' ? (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            частотность #{variant.freqRank}
          </Typography.Text>
        ) : null}
      </Flex>

      {variant.translations?.length ? (
        <div>
          <Label>Переводы</Label>
          <Flex wrap gap={8} style={{ marginTop: 8 }}>
            {variant.translations.map((t) => (
              <span
                key={`${t.lang}:${t.text}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'baseline',
                  gap: 8,
                  padding: '7px 14px',
                  borderRadius: 10,
                  background: brand.primarySoft,
                }}
              >
                <span style={{ fontWeight: 500 }}>{t.text}</span>
                <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                  {t.lang}
                </Typography.Text>
              </span>
            ))}
          </Flex>
        </div>
      ) : null}

      {variant.forms?.length ? (
        <div>
          <Label>Формы</Label>
          <Flex wrap gap={8} style={{ marginTop: 8 }}>
            {variant.forms.map((form) => (
              <Tag
                key={`${form.text}:${form.feature ?? ''}`}
                style={{ margin: 0, padding: '4px 12px', borderRadius: 8 }}
              >
                {form.text}
                {form.feature ? (
                  <Typography.Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>
                    {form.feature}
                  </Typography.Text>
                ) : null}
              </Tag>
            ))}
          </Flex>
        </div>
      ) : null}

      <RefList title="Синонимы" refs={variant.synonyms} onOpen={onOpen} />
      <RefList title="Антонимы" refs={variant.antonyms} onOpen={onOpen} />
      <RefList title="Шире по смыслу" refs={variant.hypernyms} onOpen={onOpen} />

      <div style={{ height: 1, background: token.colorBorderSecondary }} />
    </Flex>
  )
}

/** Карточка слова: премиум-модалка с вариантами по частям речи. */
export function WordModal({ wordId, onClose, onOpen }: Props) {
  const { token } = theme.useToken()
  const card = useWordStore((state) => state.card)
  const status = useWordStore((state) => state.cardStatus)
  const error = useWordStore((state) => state.cardError)
  const fetchCard = useWordStore((state) => state.fetchCard)
  const clearCard = useWordStore((state) => state.clearCard)
  const byId = useMasteryStore((state) => state.byId)

  useEffect(() => {
    if (wordId) void fetchCard(wordId)
    else clearCard()
  }, [wordId, fetchCard, clearCard])

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
            onRetry={() => wordId && void fetchCard(wordId)}
            title="Не удалось открыть слово"
          />
        </div>
      )
    }
    if (!card) return null

    const wordStatus = resolveStatus(card.id, card.status, byId)
    const color = MASTERY_META[wordStatus].color
    const variants = card.variants ?? []

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
                background: `${color}1F`,
              }}
            >
              <Leaf size={26} color={color} />
            </span>
            <div style={{ minWidth: 0 }}>
              <Flex align="baseline" gap={12} wrap>
                <Typography.Title level={2} style={{ margin: 0, lineHeight: 1.1 }}>
                  {card.lemma}
                </Typography.Title>
                {card.ipa ? (
                  <Typography.Text
                    type="secondary"
                    style={{ fontFamily: 'ui-monospace, monospace', fontSize: 16 }}
                  >
                    {card.ipa}
                  </Typography.Text>
                ) : null}
              </Flex>
              {typeof card.freqRank === 'number' ? (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  частотность #{card.freqRank}
                </Typography.Text>
              ) : null}
            </div>
          </Flex>
        </div>

        <Flex vertical gap={22} style={{ padding: '24px 28px 32px' }}>
          <div>
            <Label>Мой статус</Label>
            <div style={{ marginTop: 10 }}>
              <MasteryControl wordId={card.id} status={wordStatus} size="large" />
            </div>
          </div>

          {variants.length ? (
            variants.map((variant) => (
              <VariantBlock key={variant.pos} variant={variant} onOpen={onOpen} />
            ))
          ) : (
            <Typography.Text type="secondary">
              Детали для этого слова пока не заполнены.
            </Typography.Text>
          )}
        </Flex>
      </>
    )
  }

  return (
    <Modal
      open={Boolean(wordId)}
      onCancel={onClose}
      footer={null}
      centered
      width={560}
      destroyOnHidden
      title={null}
      styles={{ body: { padding: 0 }, content: { padding: 0, overflow: 'hidden' } }}
    >
      {renderContent()}
    </Modal>
  )
}
