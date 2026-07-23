import { Card } from 'antd'
import { Sprout } from 'lucide-react'

import { useSessionStore } from '@entities/session'
import { displayName } from '@entities/user'
import { brand } from '@shared/theme'
import { EmptyState, PageHeader } from '@shared/ui'

/**
 * Домашняя оболочка. Приветствие — на реальных данных пользователя.
 * Сам «сад» не рисуем: по договорённости без бэкенда ничего не показываем,
 * а доменного API сада пока нет — показываем честный empty-state.
 */
export function HomePage() {
  const user = useSessionStore((state) => state.user)

  return (
    <>
      <PageHeader
        title={`Здравствуйте, ${displayName(user)}`}
        description="Ваш сад знаний ещё только прорастает."
      />
      <Card variant="borderless">
        <EmptyState
          icon={<Sprout size={44} color={brand.primary} strokeWidth={1.5} />}
          title="Сад пока пуст"
          description="Визуализация сада появится, когда будет готов доменный API. Сейчас доступны профиль и настройки аккаунта."
        />
      </Card>
    </>
  )
}
