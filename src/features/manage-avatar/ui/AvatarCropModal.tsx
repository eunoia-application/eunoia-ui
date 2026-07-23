import { Modal, Slider } from 'antd'
import { useCallback, useState } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'

import { getCroppedBlob } from '../lib/cropImage'

interface AvatarCropModalProps {
  open: boolean
  imageSrc: string | null
  loading?: boolean
  onCancel: () => void
  onCropped: (file: File) => void
}

/** Кадрирование аватара: круглое выделение + зум перед загрузкой. */
export function AvatarCropModal({
  open,
  imageSrc,
  loading,
  onCancel,
  onCropped,
}: AvatarCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)

  const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), [])

  const handleOk = async () => {
    if (!imageSrc || !area) return
    const blob = await getCroppedBlob(imageSrc, area)
    onCropped(new File([blob], 'avatar.png', { type: 'image/png' }))
  }

  return (
    <Modal
      open={open}
      title="Кадрирование аватара"
      okText="Сохранить"
      cancelText="Отмена"
      confirmLoading={loading}
      onOk={handleOk}
      onCancel={onCancel}
      centered
      destroyOnHidden
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 320,
          background: '#000',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {imageSrc ? (
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        ) : null}
      </div>
      <Slider
        min={1}
        max={3}
        step={0.05}
        value={zoom}
        onChange={setZoom}
        tooltip={{ open: false }}
        style={{ marginTop: 20 }}
      />
    </Modal>
  )
}
