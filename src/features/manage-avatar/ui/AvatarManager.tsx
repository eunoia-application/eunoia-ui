import { Button, Flex, Upload } from 'antd'
import type { UploadProps } from 'antd'
import { Trash2, Upload as UploadIcon } from 'lucide-react'
import { useState } from 'react'

import { UserAvatar, useUserStore } from '@entities/user'
import { notify } from '@shared/lib'

const MAX_MB = 5
const ACCEPT = ['image/png', 'image/jpeg', 'image/webp']

/** Управление аватаром: загрузка файла (multipart) и удаление. */
export function AvatarManager() {
  const profile = useUserStore((state) => state.profile)
  const uploadAvatar = useUserStore((state) => state.uploadAvatar)
  const deleteAvatar = useUserStore((state) => state.deleteAvatar)
  const [busy, setBusy] = useState(false)

  const runUpload = async (file: File) => {
    setBusy(true)
    try {
      await uploadAvatar(file)
    } catch {
      /* уведомление показывает стор */
    } finally {
      setBusy(false)
    }
  }

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    if (!ACCEPT.includes(file.type)) {
      notify.error('Неверный формат', 'Поддерживаются PNG, JPG и WEBP')
      return Upload.LIST_IGNORE
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      notify.error('Файл слишком большой', `Максимум ${MAX_MB} МБ`)
      return Upload.LIST_IGNORE
    }
    void runUpload(file)
    return false // загружаем сами через стор, без авто-запроса antd
  }

  const handleDelete = async () => {
    setBusy(true)
    try {
      await deleteAvatar()
    } catch {
      /* уведомление показывает стор */
    } finally {
      setBusy(false)
    }
  }

  return (
    <Flex align="center" gap={16} wrap>
      <UserAvatar user={profile} size={72} />
      <Flex gap={8} wrap>
        <Upload
          beforeUpload={beforeUpload}
          showUploadList={false}
          accept={ACCEPT.join(',')}
        >
          <Button icon={<UploadIcon size={16} />} loading={busy}>
            Загрузить
          </Button>
        </Upload>
        {profile?.avatarUrl ? (
          <Button icon={<Trash2 size={16} />} onClick={handleDelete} loading={busy} danger>
            Удалить
          </Button>
        ) : null}
      </Flex>
    </Flex>
  )
}
