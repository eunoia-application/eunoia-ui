export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', () => reject(new Error('Не удалось загрузить изображение')))
    image.src = src
  })
}

/**
 * Вырезает выбранную область изображения в PNG-Blob (квадрат под круглый аватар).
 * Используется canvas — работает в браузере, в тестах не гоняется (jsdom без canvas).
 */
export async function getCroppedBlob(imageSrc: string, area: CropArea): Promise<Blob> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = area.width
  canvas.height = area.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context недоступен')

  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    area.width,
    area.height,
  )

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Не удалось обрезать изображение'))),
      'image/png',
    )
  })
}
