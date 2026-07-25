import { hash01, lerp } from './math'

/** Одномерный value-noise: плавная псевдослучайная волна в [-1, 1]. */
export function noise1(x: number) {
  const i = Math.floor(x)
  const f = x - i
  const u = f * f * (3 - 2 * f)
  return lerp(hash01(i) * 2 - 1, hash01(i + 1) * 2 - 1, u)
}

/** Фрактальный шум (сумма октав) — «дыхание» ветра без видимой периодики, [-1, 1]. */
export function fbm1(x: number, octaves = 3) {
  let sum = 0
  let amp = 0.5
  let freq = 1
  let norm = 0
  for (let o = 0; o < octaves; o += 1) {
    sum += noise1(x * freq + o * 17.31) * amp
    norm += amp
    amp *= 0.5
    freq *= 2.03
  }
  return sum / norm
}
