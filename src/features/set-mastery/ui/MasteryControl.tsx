import { Segmented } from 'antd'

import { MASTERY_META, MASTERY_ORDER, useMasteryStore } from '@entities/mastery'
import type { MasteryStatus } from '@shared/api'

interface Props {
  lexemeId: string
  status: MasteryStatus
  size?: 'small' | 'middle' | 'large'
}

/** Отметка владения словом: клик красит лист сразу, откат и тост делает стор. */
export function MasteryControl({ lexemeId, status, size = 'middle' }: Props) {
  const setStatus = useMasteryStore((state) => state.setStatus)

  return (
    <Segmented<MasteryStatus>
      size={size}
      value={status}
      onChange={(next) => {
        // Ошибку стор уже показал тостом и откатил — здесь глушим reject.
        void setStatus(lexemeId, next).catch(() => undefined)
      }}
      options={MASTERY_ORDER.map((value) => ({
        value,
        label: MASTERY_META[value].label,
      }))}
    />
  )
}
