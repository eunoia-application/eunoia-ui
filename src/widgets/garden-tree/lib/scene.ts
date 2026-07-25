/**
 * Геометрия сада без Pixi/React — чтобы hit-тест кроны был чистым и тестируемым.
 * Крона = грозди (ветки), каждая гроздь ↔ блок слов; листья грозди ↔ слова блока.
 */

export const W = 360
export const H = 348
export const MAX_WIDTH = 420
export const GOLDEN = 2.399963
export const LEAF_TARGET = 132

export interface Cluster {
  x: number
  y: number
  r: number
}

// Позиции гроздей на концах веток. Первые N привязываются к блокам слов.
export const CLUSTERS: Cluster[] = [
  { x: 180, y: 92, r: 56 },
  { x: 120, y: 138, r: 47 },
  { x: 240, y: 138, r: 47 },
  { x: 148, y: 184, r: 40 },
  { x: 212, y: 184, r: 40 },
]

export interface LeafSpec {
  x: number
  y: number
  s: number
  /** Индекс грозди (= блока). */
  cluster: number
  /** Порядковый номер листа внутри грозди (= индекс слова в блоке). */
  local: number
}

/** Раскладка листьев по гроздям (филлотаксис). Детерминированная — индексы стабильны. */
export function buildLeafSpecs(target = LEAF_TARGET): LeafSpec[] {
  const specs: LeafSpec[] = []
  const areaSum = CLUSTERS.reduce((sum, c) => sum + c.r * c.r, 0)
  let planned = 0
  CLUSTERS.forEach((c, ci) => {
    const n =
      ci === CLUSTERS.length - 1
        ? target - planned
        : Math.round((target * (c.r * c.r)) / areaSum)
    for (let k = 0; k < n; k += 1) {
      const a = k * GOLDEN
      const rr = Math.sqrt(k / Math.max(n, 1)) * c.r
      specs.push({
        x: c.x + rr * Math.cos(a),
        y: c.y + rr * Math.sin(a) * 0.92,
        s: 0.55 + (1 - k / Math.max(n, 1)) * 0.42,
        cluster: ci,
        local: k,
      })
    }
    planned += n
  })
  return specs
}

/** Сколько листьев в каждой грозди — размер запроса слов для блока. */
export function clusterLeafCounts(specs: LeafSpec[]): number[] {
  const counts = CLUSTERS.map(() => 0)
  for (const s of specs) counts[s.cluster] += 1
  return counts
}

/** Гроздь под курсором (world-координаты) среди первых `count` активных. */
export function hitCluster(x: number, y: number, count: number): number | null {
  let best: number | null = null
  let bestD = Infinity
  const limit = Math.min(count, CLUSTERS.length)
  for (let i = 0; i < limit; i += 1) {
    const c = CLUSTERS[i]
    const d = Math.hypot(x - c.x, y - c.y)
    if (d <= c.r && d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

/** Лист под курсором внутри активной грозди — возвращает индекс в `specs`. */
export function hitLeaf(
  x: number,
  y: number,
  specs: LeafSpec[],
  activeCluster: number,
): number | null {
  let best: number | null = null
  let bestD = Infinity
  for (let i = 0; i < specs.length; i += 1) {
    const s = specs[i]
    if (s.cluster !== activeCluster) continue
    const d = Math.hypot(x - s.x, y - s.y)
    const r = 9 * s.s
    if (d <= r && d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}
