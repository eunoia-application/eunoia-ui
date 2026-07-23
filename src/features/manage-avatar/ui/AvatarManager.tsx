import { Button, Flex, Upload } from 'antd'
import type { UploadProps } from 'antd'
import { Trash2, Upload as UploadIcon } from 'lucide-react'
import { useState } from 'react'

import { UserAvatar, useUserStore } from '@entities/user'
import { notify } from '@shared/lib'

import { AvatarCropModal } from './AvatarCropModal'

const MAX_MB = 5
const ACCEPT = ['image/png', 'image/jpeg', 'image/webp']

/** Управление аватаром: выбор файла → кадрирование → загрузка + удаление. */
export function AvatarManager() {
  const profile = useUserStore((state) => state.profile)
  const uploadAvatar = useUserStore((state) => state.uploadAvatar)
  const deleteAvatar = useUserStore((state) => state.deleteAvatar)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    if (!ACCEPT.includes(file.type)) {
      notify.error('Неверный формат', 'Поддерживаются PNG, JPG и WEBP')
      return Upload.LIST_IGNORE
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      notify.error('Файл слишком большой', `Максимум ${MAX_MB} МБ`)
      return Upload.LIST_IGNORE
    }
    const reader = new FileReader()
    reader.addEventListener('load', () => setCropSrc(reader.result as string))
    reader.readAsDataURL(file)
    return false // не грузим напрямую — сперва кадрируем
  }

  const handleCropped = async (file: File) => {
    setBusy(true)
    try {
      await uploadAvatar(file)
      setCropSrc(null)
    } catch {
      /* уведомление показывает стор */
    } finally {
      setBusy(false)
    }
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
        <Upload beforeUpload={beforeUpload} showUploadList={false} accept={ACCEPT.join(',')}>
          <Button icon={<UploadIcon size={16} />}>Загрузить</Button>
        </Upload>
        {profile?.avatarUrl ? (
          <Button icon={<Trash2 size={16} />} onClick={handleDelete} loading={busy} danger>
            Удалить
          </Button>
        ) : null}
      </Flex>

      <AvatarCropModal
        open={cropSrc !== null}
        imageSrc={cropSrc}
        loading={busy}
        onCancel={() => setCropSrc(null)}
        onCropped={handleCropped}
      />
    </Flex>
  )
}
