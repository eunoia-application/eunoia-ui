import { Button, Result } from 'antd'

import type { ApiError } from '@shared/api'

interface ErrorRetryProps {
  error?: ApiError | null
  onRetry?: () => void
  title?: string
}

function statusToResult(status?: number): '403' | '404' | '500' | 'error' {
  if (status === 403) return '403'
  if (status === 404) return '404'
  if (status && status >= 500) return '500'
  return 'error'
}

/** Ошибка загрузки с кнопкой повтора — единый retry-state. */
export function ErrorRetry({
  error,
  onRetry,
  title = 'Не удалось загрузить',
}: ErrorRetryProps) {
  return (
    <Result
      status={statusToResult(error?.status)}
      title={title}
      subTitle={error?.message}
      extra={
        onRetry ? (
          <Button type="primary" onClick={onRetry}>
            Повторить
          </Button>
        ) : undefined
      }
    />
  )
}
