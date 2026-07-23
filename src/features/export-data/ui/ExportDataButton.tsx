import { Button } from 'antd'
import { Download } from 'lucide-react'
import { useState } from 'react'

import { userApi } from '@entities/user'
import { isApiError } from '@shared/api'
import { notify } from '@shared/lib'

/** Экспорт данных пользователя (GET /users/me/export) → скачивание JSON. */
export function ExportDataButton() {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const data = await userApi.exportMyData()
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `eunoia-export-${data.exportedAt.slice(0, 10)}.json`
      link.click()
      URL.revokeObjectURL(url)
      notify.success('Экспорт готов', 'Файл сохранён')
    } catch (error) {
      notify.error(
        'Не удалось экспортировать',
        isApiError(error) ? error.message : undefined,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button icon={<Download size={16} />} onClick={handleExport} loading={loading}>
      Скачать мои данные (JSON)
    </Button>
  )
}
