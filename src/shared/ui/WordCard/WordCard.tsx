import { Flex, theme, Typography } from 'antd'
import { Leaf } from 'lucide-react'

import type { WordLeaf } from '@shared/api'

interface Props {
  leaf: WordLeaf
  /** Цвет статуса (полоска слева + иконка). Считает вызывающий по mastery. */
  color: string
  /** Готовая подпись «глаг. · A1» — вызывающий собирает через leafMeta. */
  meta?: string
  onOpen: (id: string) => void
}

/** Карточка слова: статус-полоска слева, лемма и часть речи/уровень. */
export function WordCard({ leaf, color, meta, onOpen }: Props) {
  const { token } = theme.useToken()
  return (
    <button
      type="button"
      className="eunoia-word-card"
      onClick={() => onOpen(leaf.id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        textAlign: 'left',
        padding: '11px 13px',
        borderRadius: 12,
        cursor: 'pointer',
        font: 'inherit',
        color: 'inherit',
        background: token.colorFillQuaternary,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <Flex align="center" justify="space-between" gap={8}>
        <span style={{ fontWeight: 600 }}>{leaf.lemma}</span>
        <Leaf size={13} color={color} />
      </Flex>
      {meta ? (
        <Typography.Text type="secondary" style={{ fontSize: 11 }}>
          {meta}
        </Typography.Text>
      ) : null}
    </button>
  )
}
