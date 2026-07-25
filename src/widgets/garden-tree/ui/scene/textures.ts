import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Texture } from 'three'

import { hash01 } from '../../lib/math'
import { noise1 } from '../../lib/noise'

/**
 * Процедурные текстуры (генерируются на лету в canvas — никаких PNG-ассетов):
 * радиальные градиенты для свечений/тени и кора для ствола.
 */

const radialCache = new Map<string, Texture | null>()

/** Мягкий радиальный градиент цвета к прозрачности — свечения, тень, ореолы. */
export function getRadialTexture(color: string): Texture | null {
  const cached = radialCache.get(color)
  if (cached !== undefined) return cached
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    radialCache.set(color, null)
    return null
  }
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, color)
  g.addColorStop(0.55, `${color}66`)
  g.addColorStop(1, `${color}00`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  radialCache.set(color, texture)
  return texture
}

let leafTexture: Texture | null | undefined

/**
 * Жилки листа: центральная + боковые пары, лёгкий продольный градиент.
 * Светлая карта умножается на цвет инстанса — оттенки статусов сохраняются.
 */
export function getLeafTexture(): Texture | null {
  if (leafTexture !== undefined) return leafTexture
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    leafTexture = null
    return null
  }
  // Пластина: чуть темнее к основанию и краям — объём без освещения.
  const g = ctx.createLinearGradient(0, 0, 0, 128)
  g.addColorStop(0, 'rgb(238,240,236)')
  g.addColorStop(1, 'rgb(212,218,210)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  const edge = ctx.createRadialGradient(64, 60, 26, 64, 60, 70)
  edge.addColorStop(0, 'rgba(255,255,255,0)')
  edge.addColorStop(1, 'rgba(150,165,150,0.35)')
  ctx.fillStyle = edge
  ctx.fillRect(0, 0, 128, 128)
  // Центральная жилка (canvas y=0 — кончик листа, y=128 — черешок).
  ctx.strokeStyle = 'rgba(120,140,120,0.8)'
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.lineWidth = 2.6
  ctx.moveTo(64, 126)
  ctx.lineTo(64, 10)
  ctx.stroke()
  // Боковые жилки — пары под углом к кончику.
  ctx.strokeStyle = 'rgba(130,150,130,0.55)'
  ctx.lineWidth = 1.4
  for (let i = 0; i < 5; i += 1) {
    const y0 = 112 - i * 20
    for (const side of [-1, 1]) {
      ctx.beginPath()
      ctx.moveTo(64, y0)
      ctx.quadraticCurveTo(64 + side * 26, y0 - 12, 64 + side * 44, y0 - 22)
      ctx.stroke()
    }
  }
  leafTexture = new CanvasTexture(canvas)
  return leafTexture
}

let budTexture: Texture | null | undefined

/**
 * Почка в настоящих цветах (материал белый, без покраски инстансов):
 * коричневые кроющие чешуйки у основания плавно перетекают в молодую зелень
 * к кончику — из почки «проклёвывается» лист.
 */
export function getBudTexture(): Texture | null {
  if (budTexture !== undefined) return budTexture
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    budTexture = null
    return null
  }
  // canvas сверху вниз = кончик → основание (flipY у CanvasTexture).
  const g = ctx.createLinearGradient(0, 0, 0, 64)
  g.addColorStop(0, 'rgb(186,232,202)')
  g.addColorStop(0.4, 'rgb(138,211,160)')
  g.addColorStop(0.75, 'rgb(156,148,104)')
  g.addColorStop(1, 'rgb(148,112,76)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  // Дуги чешуек: у коричневого основания заметнее, кверху растворяются.
  ctx.lineWidth = 1.6
  for (let i = 0; i < 3; i += 1) {
    const y = 54 - i * 14
    ctx.strokeStyle = `rgba(104, 84, 56, ${0.5 - i * 0.14})`
    ctx.beginPath()
    ctx.moveTo(4, y + 8)
    ctx.quadraticCurveTo(32, y - 12, 60, y + 8)
    ctx.stroke()
  }
  budTexture = new CanvasTexture(canvas)
  budTexture.colorSpace = SRGBColorSpace
  budTexture.wrapS = RepeatWrapping
  return budTexture
}

let barkTexture: Texture | null | undefined

/** Кора: вертикальные борозды на шуме — модулирует базовый цвет материала. */
export function getBarkTexture(): Texture | null {
  if (barkTexture !== undefined) return barkTexture
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    barkTexture = null
    return null
  }
  for (let x = 0; x < canvas.width; x += 1) {
    // Каждая колонка — своя борозда; вдоль высоты яркость плывёт шумом.
    const streak = noise1(x * 0.24) * 30
    for (let y = 0; y < canvas.height; y += 1) {
      const v = 208 + streak + noise1(y * 0.05 + x * 1.7) * 26 + (hash01(x, y) - 0.5) * 20
      const c = Math.max(120, Math.min(250, Math.round(v)))
      ctx.fillStyle = `rgb(${c},${Math.round(c * 0.94)},${Math.round(c * 0.86)})`
      ctx.fillRect(x, y, 1, 1)
    }
  }
  barkTexture = new CanvasTexture(canvas)
  barkTexture.wrapS = RepeatWrapping
  barkTexture.wrapT = RepeatWrapping
  return barkTexture
}
