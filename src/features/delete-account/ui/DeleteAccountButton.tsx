import { App, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

import { useSessionStore } from '@entities/session'
import { useUserStore } from '@entities/user'
import { isApiError } from '@shared/api'
import { PATHS } from '@shared/config'
import { notify } from '@shared/lib'

/** Удаление аккаунта с подтверждением (DELETE /auth/account). */
export function DeleteAccountButton() {
  const { modal } = App.useApp()
  const navigate = useNavigate()
  const deleteAccount = useSessionStore((state) => state.deleteAccount)
  const resetUser = useUserStore((state) => state.reset)

  const confirm = () => {
    modal.confirm({
      title: 'Удалить аккаунт?',
      content:
        'Профиль и все связанные данные будут удалены безвозвратно. Это действие нельзя отменить.',
      okText: 'Удалить аккаунт',
      okButtonProps: { danger: true },
      cancelText: 'Отмена',
      centered: true,
      onOk: async () => {
        try {
          await deleteAccount()
          resetUser()
          notify.success('Аккаунт удалён')
          navigate(PATHS.auth, { replace: true })
        } catch (error) {
          notify.error(
            'Не удалось удалить аккаунт',
            isApiError(error) ? error.message : undefined,
          )
        }
      },
    })
  }

  return (
    <Button danger onClick={confirm}>
      Удалить аккаунт
    </Button>
  )
}
