import { Card } from 'antd'
import { SpellCheck } from 'lucide-react'

import { brand } from '@shared/theme'
import { EmptyState, PageHeader } from '@shared/ui'

/**
 * Грамматика — ствол сада. Контракт 2.2.0 отдаёт правило только по id
 * (GET /learning/grammar/{id}), перечня правил нет — показывать нечего.
 * По договорённости без бэкенда ничего не выдумываем.
 */
export function GrammarPage() {
  return (
    <>
      <PageHeader
        title="Грамматика"
        description="Ствол сада: конструкции, на которых держатся ветки."
      />
      <Card variant="borderless">
        <EmptyState
          icon={<SpellCheck size={44} color={brand.primary} strokeWidth={1.5} />}
          title="Раздел ждёт контракт"
          description="Сейчас API отдаёт правило только по идентификатору — списка правил нет. Как появится перечень, здесь вырастет ствол."
        />
      </Card>
    </>
  )
}
