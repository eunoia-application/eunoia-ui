import { Drawer, Flex, Tag, Typography } from 'antd'
import { useEffect } from 'react'

import { POS_LABEL, useLexemeStore } from '@entities/lexeme'
import { resolveStatus, useMasteryStore } from '@entities/mastery'
import { MasteryControl } from '@features/set-mastery'
import type { LexemeRef } from '@shared/api'
import { ErrorRetry, FormSkeleton } from '@shared/ui'

interface Props {
  lexemeId: string | null
  onClose: () => void
  /** Переход по связи графа — открывает карточку соседнего слова. */
  onOpen: (lexemeId: string) => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {title}
      </Typography.Text>
      <div style={{ marginTop: 6 }}>{children}</div>
    </div>
  )
}

function RefList({
  title,
  refs,
  onOpen,
}: {
  title: string
  refs?: LexemeRef[]
  onOpen: (id: string) => void
}) {
  if (!refs?.length) return null
  return (
    <Section title={title}>
      <Flex wrap gap={6}>
        {refs.map((ref) => (
          <Tag
            key={ref.id}
            style={{ cursor: 'pointer', margin: 0 }}
            onClick={() => onOpen(ref.id)}
          >
            {ref.lemma}
          </Tag>
        ))}
      </Flex>
    </Section>
  )
}

/** Детали листа: формы, переводы, связи графа + отметка владения. */
export function LexemeDrawer({ lexemeId, onClose, onOpen }: Props) {
  const card = useLexemeStore((state) => state.card)
  const status = useLexemeStore((state) => state.status)
  const error = useLexemeStore((state) => state.error)
  const fetchCard = useLexemeStore((state) => state.fetchCard)
  const clear = useLexemeStore((state) => state.clear)
  const byId = useMasteryStore((state) => state.byId)

  useEffect(() => {
    if (lexemeId) void fetchCard(lexemeId)
    else clear()
  }, [lexemeId, fetchCard, clear])

  const renderBody = () => {
    if (status === 'loading') return <FormSkeleton fields={3} />
    if (status === 'error') {
      return (
        <ErrorRetry
          error={error}
          onRetry={() => lexemeId && void fetchCard(lexemeId)}
          title="Не удалось открыть слово"
        />
      )
    }
    if (!card) return null

    return (
      <Flex vertical gap={22}>
        <Flex wrap gap={6}>
          {card.pos ? <Tag>{POS_LABEL[card.pos]}</Tag> : null}
          {card.cefr ? <Tag color="green">{card.cefr}</Tag> : null}
          {typeof card.freqRank === 'number' ? (
            <Tag>частотность #{card.freqRank}</Tag>
          ) : null}
        </Flex>

        <Section title="Мой статус">
          <MasteryControl
            lexemeId={card.id}
            status={resolveStatus(card.id, card.status, byId)}
          />
        </Section>

        {card.translations?.length ? (
          <Section title="Переводы">
            <Flex wrap gap={6}>
              {card.translations.map((translation) => (
                <Tag key={`${translation.lang}:${translation.text}`} style={{ margin: 0 }}>
                  {translation.text}
                  <Typography.Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>
                    {translation.lang}
                  </Typography.Text>
                </Tag>
              ))}
            </Flex>
          </Section>
        ) : null}

        {card.forms?.length ? (
          <Section title="Формы">
            <Flex wrap gap={6}>
              {card.forms.map((form) => (
                <Tag key={`${form.text}:${form.feature ?? ''}`} style={{ margin: 0 }}>
                  {form.text}
                  {form.feature ? (
                    <Typography.Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>
                      {form.feature}
                    </Typography.Text>
                  ) : null}
                </Tag>
              ))}
            </Flex>
          </Section>
        ) : null}

        <RefList title="Синонимы" refs={card.synonyms} onOpen={onOpen} />
        <RefList title="Антонимы" refs={card.antonyms} onOpen={onOpen} />
        <RefList title="Шире по смыслу" refs={card.hypernyms} onOpen={onOpen} />
      </Flex>
    )
  }

  return (
    <Drawer
      open={Boolean(lexemeId)}
      onClose={onClose}
      width={440}
      title={card?.lemma ?? 'Слово'}
      destroyOnHidden
    >
      {renderBody()}
    </Drawer>
  )
}
