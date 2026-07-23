// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- App нужен как значение для `typeof App.useApp`
import { App } from 'antd'
import type { ReactNode } from 'react'

/**
 * Мост к нотификациям AntD. `App.useApp()` даёт instance, привязанный к теме
 * ConfigProvider (и совместимый с React 19). Здесь храним его синглтоном,
 * чтобы уведомлять из не-компонентного кода — сторов, интерсепторов.
 *
 * Инстанс привязывается один раз в app-слое через <NotifyBridge/> (bindNotify).
 */
type AppApi = ReturnType<typeof App.useApp>

let api: AppApi | null = null

export function bindNotify(instance: AppApi): void {
  api = instance
}

export const notify = {
  success(message: ReactNode, description?: ReactNode): void {
    api?.notification.success({ message, description })
  },
  error(message: ReactNode, description?: ReactNode): void {
    api?.notification.error({ message, description })
  },
  info(message: ReactNode, description?: ReactNode): void {
    api?.notification.info({ message, description })
  },
  warning(message: ReactNode, description?: ReactNode): void {
    api?.notification.warning({ message, description })
  },
  /** Короткий toast для мелких подтверждений. */
  toast(content: ReactNode): void {
    api?.message.open({ type: 'success', content })
  },
}
