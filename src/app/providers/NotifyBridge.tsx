import { App } from 'antd'
import { useEffect } from 'react'

import { bindNotify } from '@shared/lib'

/**
 * Привязывает instance нотификаций AntD (из контекста <App/>) к синглтону
 * notify — чтобы уведомлять из сторов/интерсепторов. Ничего не рендерит.
 */
export function NotifyBridge() {
  const app = App.useApp()

  useEffect(() => {
    bindNotify(app)
  }, [app])

  return null
}
