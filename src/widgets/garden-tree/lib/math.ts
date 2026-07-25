/** Чистая математика сада: интерполяции, сглаживания и детерминированный хеш. */

export const TAU = Math.PI * 2

/** Золотой угол — филлотаксис: листья и ветви не накладываются друг на друга. */
export const GOLDEN_ANGLE = 2.399963229728653

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export const clamp01 = (v: number) => clamp(v, 0, 1)

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Плавная ступень (семантика GLSL): 0 до edge0, 1 после edge1, кубика между. */
export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

export const easeOutCubic = (t: number) => 1 - (1 - clamp01(t)) ** 3

/**
 * Детерминированный хеш набора чисел → [0, 1).
 * Одни и те же аргументы всегда дают то же значение — «случайность» дерева
 * стабильна между кадрами и перестройками скелета.
 */
export function hash01(...nums: number[]) {
  let d = 0
  const K = [127.1, 311.7, 74.7]
  for (let i = 0; i < nums.length; i += 1) d += (nums[i] + 1.618) * K[i % 3]
  const s = Math.sin(d) * 43758.5453123
  return s - Math.floor(s)
}
