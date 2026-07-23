import { Card } from 'antd'
import { TreeDeciduous } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useSessionStore } from '@entities/session'
import { displayName } from '@entities/user'
import { PATHS } from '@shared/config'
import { brand } from '@shared/theme'
import { EmptyState, PageHeader } from '@shared/ui'

/** Сад — только визуализация дерева. Пока её нет, честно об этом говорим. */
export function HomePage() {
  const navigate = useNavigate()
  const user = useSessionStore((state) => state.user)

  return (
    <>
      <PageHeader
        title={`Здравствуйте, ${displayName(user)}`}
        description="Ваш сад знаний: слова становятся листьями, грамматика — стволом."
      />
      <Card variant="borderless">
        <EmptyState
          icon={<TreeDeciduous size={44} color={brand.primary} strokeWidth={1.5} />}
          title="Дерево ещё растёт"
          description="Здесь появится живая визуализация сада: ствол грамматики, ветки тем и листья слов."
          action={{ label: 'Перейти к словам', onClick: () => navigate(PATHS.words) }}
        />
      </Card>
    </>
  )
}
