import { Button, Flex } from 'antd'

import { MASTERY_ACTIONS, MASTERY_META, useMasteryStore } from '@entities/mastery'
import type { MasteryStatus } from '@shared/api'

interface Props {
  wordId: string
  status: MasteryStatus
  size?: 'small' | 'middle' | 'large'
}

/** Отметка владения: две кнопки «Знаю / Учить». Повтор по активной — снять. */
export function MasteryControl({ wordId, status, size = 'middle' }: Props) {
  const setStatus = useMasteryStore((state) => state.setStatus)

  const choose = (action: MasteryStatus) => {
    const next: MasteryStatus = status === action ? 'UNKNOWN' : action
    // Ошибку стор уже показал тостом и откатил — здесь глушим reject.
    void setStatus(wordId, next).catch(() => undefined)
  }

  return (
    <Flex gap={8}>
      {MASTERY_ACTIONS.map((action) => {
        const active = status === action
        const { label, color } = MASTERY_META[action]
        return (
          <Button
            key={action}
            size={size}
            type={active ? 'primary' : 'default'}
            onClick={() => choose(action)}
            style={active ? { background: color, borderColor: color } : undefined}
          >
            {label}
          </Button>
        )
      })}
    </Flex>
  )
}
