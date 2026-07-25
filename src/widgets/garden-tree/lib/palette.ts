import { brand } from '@shared/theme'

import { clamp01 } from './math'

/** Палитра листвы: снизу тень кроны, сверху солнце.
 * Чуть сочнее брендовых — ACES-тонмаппинг приглушает насыщенность. */
export const LEAF_DARK = '#1c4c33'
export const LEAF_MID = brand.primary
export const LEAF_LIGHT = '#55b47c'

// Цвета почки «Учить» (коричневые чешуйки → молодая зелень) запечены в её
// текстуре (scene/textures.ts). Жёлтый зарезервирован под «забывается».

/** Плод на полностью освоенном блоке (known == total). */
export const FRUIT_COLOR = '#c96a4a'

/** Кора: молодой побег травянисто-зелёный, взрослый ствол деревенеет.
 * Цвета светлее «настоящих» — ACES-тонмаппинг и борозды текстуры затемняют. */
export const BARK_YOUNG = '#6fbc8d'
export const BARK_OLD = '#9a7350'

export interface Rgb {
  r: number
  g: number
  b: number
}

export function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16)
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 }
}

export function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return { r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t }
}

const P_DARK = hexToRgb(LEAF_DARK)
const P_MID = hexToRgb(LEAF_MID)
const P_LIGHT = hexToRgb(LEAF_LIGHT)

/** Оттенок листа по вертикальному свету: 0 — тень внутри кроны, 1 — солнце сверху. */
export function leafShade(lightT: number): Rgb {
  const t = clamp01(lightT)
  return t < 0.5 ? mixRgb(P_DARK, P_MID, t * 2) : mixRgb(P_MID, P_LIGHT, (t - 0.5) * 2)
}
