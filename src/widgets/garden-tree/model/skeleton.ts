import { Vector3 } from 'three'

import { CLUSTER_CAPACITY, MAX_BRANCHES, TREE_SEED } from '../lib/constants'
import { GOLDEN_ANGLE, TAU, clamp01, hash01, lerp, smoothstep } from '../lib/math'
import { noise1 } from '../lib/noise'

import { branchMaturity, type TreeDims } from './growth'

/**
 * Скелет дерева — чистая геометрия без Three-рендера: осевые линии ствола
 * и ветвей с радиусами, слоты листьев и зоны гроздей для hit-теста.
 * Детерминирован: одно и то же состояние роста даёт тот же скелет.
 */

export interface BranchPath {
  points: Vector3[]
  radii: number[]
}

export interface BranchSpec extends BranchPath {
  /** Индекс блока-грозди; -1 — декоративная веточка. */
  cluster: number
}

export interface LeafSlot {
  /** Индекс блока; -1 — семядоли ростка (неинтерактивны). */
  cluster: number
  /** Порядковый номер слова внутри блока (по частоте). */
  local: number
  position: Vector3
  /** Наружу от центра грозди — базовая ориентация листа. */
  normal: Vector3
  /** Джиттер размера 0.75..1.25. */
  size: number
  /** Фаза собственной анимации. */
  phase: number
  /** Вертикальный свет 0..1: низ кроны в тени, верх на солнце. */
  lightT: number
}

export interface ClusterZone {
  center: Vector3
  radius: number
}

export interface TreeSkeleton {
  trunk: BranchPath
  branches: BranchSpec[]
  slots: LeafSlot[]
  /** Семядоли ростка — исчезают по мере одревеснения. */
  cotyledons: LeafSlot[]
  /** Зоны гроздей (по активным блокам) — сферы наведения. */
  clusters: ClusterZone[]
  height: number
}

const TRUNK_SEGS = 14
const BRANCH_SEGS = 8

/** Направление из азимута и возвышения над горизонтом. */
function dirFrom(azimuth: number, elevation: number) {
  const c = Math.cos(elevation)
  return new Vector3(c * Math.cos(azimuth), Math.sin(elevation), c * Math.sin(azimuth))
}

/** Точка на полилинии по параметру t ∈ [0, 1]. */
export function pointAt(path: BranchPath, t: number): Vector3 {
  const f = clamp01(t) * (path.points.length - 1)
  const i = Math.min(Math.floor(f), path.points.length - 2)
  return path.points[i].clone().lerp(path.points[i + 1], f - i)
}

/** Радиус на полилинии по параметру t ∈ [0, 1]. */
export function radiusAt(path: BranchPath, t: number): number {
  const f = clamp01(t) * (path.radii.length - 1)
  const i = Math.min(Math.floor(f), path.radii.length - 2)
  return lerp(path.radii[i], path.radii[i + 1], f - i)
}

function buildTrunk(dims: TreeDims, seed: number): BranchPath {
  const points: Vector3[] = []
  const radii: number[] = []
  const h = dims.height
  const leanAz = hash01(seed, 91) * TAU
  const leanAmt = 0.08 + hash01(seed, 92) * 0.08
  const p = new Vector3()
  for (let j = 0; j <= TRUNK_SEGS; j += 1) {
    const t = j / TRUNK_SEGS
    points.push(p.clone())
    // Утолщение у корней, сужение к вершине; лёгкая неровность коры.
    const flare = j === 0 ? 1.16 : j === 1 ? 1.05 : 1
    const wave = 1 + noise1(t * 5.1 + seed) * 0.08
    radii.push(Math.max(0.006, dims.baseRadius * (1 - t) ** 1.3 * flare * wave))
    if (j < TRUNK_SEGS) {
      // Ствол ведём вверх с растущим к вершине наклоном и живым изгибом.
      const tilt = leanAmt * t + noise1(t * 2.7 + seed * 3.1) * 0.05
      const d = dirFrom(leanAz, Math.PI / 2 - tilt)
      p.addScaledVector(d, h / TRUNK_SEGS)
    }
  }
  return { points, radii }
}

interface BranchSeed {
  base: Vector3
  azimuth: number
  elevation: number
  length: number
  radius: number
  key: number
}

function buildBranchPath(s: BranchSeed, seed: number): BranchPath {
  const points: Vector3[] = []
  const radii: number[] = []
  const p = s.base.clone()
  for (let j = 0; j <= BRANCH_SEGS; j += 1) {
    const t = j / BRANCH_SEGS
    points.push(p.clone())
    radii.push(Math.max(0.005, s.radius * (1 - t) ** 1.25))
    if (j < BRANCH_SEGS) {
      // Ветвь заваливается к горизонту, кончик слегка приподнят к свету.
      const el = s.elevation * (1 - 0.75 * t) + 0.5 * t * t
      const wobble = (hash01(seed, s.key, j) - 0.5) * 0.35
      const az = s.azimuth + (hash01(seed, s.key, j, 4) - 0.5) * 0.4 * t
      p.addScaledVector(dirFrom(az, el + wobble * 0.4), s.length / BRANCH_SEGS)
    }
  }
  return { points, radii }
}

/**
 * Гроздь листьев. Каждый лист якорится на коре — черешок касается стебля или
 * ветви, ничего не висит в воздухе. Пока ветвь незрелая, листья распускаются
 * вдоль ствола (росток → молодой побег); со зрелостью ветви они переезжают на
 * неё и распушаются в облако кроны — переход непрерывный.
 */
function buildCluster(
  cluster: number,
  trunk: BranchPath,
  branch: BranchPath | null,
  branchLen: number,
  maturity: number,
  progress: number,
  seed: number,
  slots: LeafSlot[],
): ClusterZone {
  // Доля «кроны»: 0 — листья на стебле, 1 — пышное облако вокруг ветви.
  const crown = branch ? smoothstep(0.05, 0.45, maturity) : 0
  const span = branchLen * 0.35
  const capacity = CLUSTER_CAPACITY[cluster]
  const first = slots.length

  // У ростка листья распускаются вдоль стебля с фиксированным шагом по номеру
  // слота (иначе первые листья и почки сбиваются в одну точку у макушки);
  // верхушка остаётся семядолям. У взрослого дерева шаг сжимается — слоты
  // нерождённых ветвей жмутся кверху, низ ствола чистый.
  const tTop = 0.86 - cluster * lerp(0.06, 0.03, progress)
  const stemStep = 0.07 * lerp(1, 0.25, progress)

  for (let k = 0; k < capacity; k += 1) {
    const frac = (k + 0.5) / capacity
    const a = k * GOLDEN_ANGLE + cluster * 1.7

    // Якорь на стебле: черешок утоплен в кору — лист растёт из ствола,
    // а не парит рядом с ним.
    const tTrunk = Math.max(0.25, tTop - k * stemStep)
    const trunkPoint = pointAt(trunk, tTrunk)
    const dirT = new Vector3(Math.cos(a), 0.3, Math.sin(a)).normalize()
    const posT = trunkPoint.addScaledVector(dirT, radiusAt(trunk, tTrunk) * 0.7)

    let position = posT
    let normal = dirT
    if (branch) {
      // Якорь на ветви: вдоль внешних двух третей + радиальное облако по зрелости.
      const tB = 0.3 + 0.68 * frac
      const y = 1 - 2 * hash01(seed, cluster, k, 4)
      const rr = Math.sqrt(Math.max(0.05, 1 - y * y))
      const dirB = new Vector3(Math.cos(a) * rr, y * 0.75, Math.sin(a) * rr).normalize()
      const depth = 0.15 + 0.85 * hash01(seed, cluster, k, 5)
      const off = radiusAt(branch, tB) * 0.7 + span * depth * crown
      const posB = pointAt(branch, tB).addScaledVector(dirB, off)
      position = posT.clone().lerp(posB, crown)
      normal = dirT.clone().lerp(dirB, crown).normalize()
    }

    slots.push({
      cluster,
      local: k,
      position,
      normal,
      size: 0.75 + 0.5 * hash01(seed, cluster, k, 6),
      phase: hash01(seed, cluster, k, 7) * TAU,
      lightT: 0.5,
    })
  }

  // Зона наведения и свет — по фактическим позициям листьев грозди.
  const mine = slots.slice(first)
  const center = mine
    .reduce((acc, s) => acc.add(s.position), new Vector3())
    .divideScalar(Math.max(1, mine.length))
  let radius = 0.09
  let minY = Infinity
  let maxY = -Infinity
  for (const s of mine) {
    radius = Math.max(radius, s.position.distanceTo(center) + 0.05)
    minY = Math.min(minY, s.position.y)
    maxY = Math.max(maxY, s.position.y)
  }
  const spanY = Math.max(1e-3, maxY - minY)
  mine.forEach((s, k) => {
    s.lightT = clamp01(
      (s.position.y - minY) / spanY + (hash01(seed, cluster, k, 8) - 0.5) * 0.3,
    )
  })
  return { center, radius }
}

/** Построить скелет дерева для текущего (анимируемого) состояния роста. */
export function buildSkeleton(dims: TreeDims, seed = TREE_SEED): TreeSkeleton {
  const trunk = buildTrunk(dims, seed)
  const branches: BranchSpec[] = []
  const slots: LeafSlot[] = []
  const clusters: ClusterZone[] = []
  const h = dims.height

  for (let i = 0; i < Math.min(dims.branchCount, MAX_BRANCHES); i += 1) {
    const m = branchMaturity(dims.progress, i)
    // Верхняя ветвь у вершины, нижние — ниже по стволу и ближе к горизонту:
    // крона занимает верхнюю половину дерева, а не жмётся к макушке.
    const tAttach = 0.9 - i * 0.13
    const azimuth = i * GOLDEN_ANGLE + hash01(seed, i, 1) * 0.6
    const elevation = lerp(1.05, 0.3, i / (MAX_BRANCHES - 1)) + (hash01(seed, i, 2) - 0.5) * 0.2
    const length = h * (0.38 + 0.12 * hash01(seed, i, 3)) * (1 - 0.05 * i) * lerp(0.12, 1, m)
    // Нерождённая ветвь не рисуется вовсе — у ростка чистый стебель,
    // его листья до поры живут прямо на стволе (см. buildCluster).
    const branch =
      m > 0.04
        ? buildBranchPath(
            {
              base: pointAt(trunk, tAttach),
              azimuth,
              elevation,
              length,
              radius: Math.max(0.006, radiusAt(trunk, tAttach) * lerp(0.4, 0.62, m)),
              key: i,
            },
            seed,
          )
        : null
    if (branch) branches.push({ ...branch, cluster: i })
    clusters.push(buildCluster(i, trunk, branch, length, m, dims.progress, seed, slots))

    // Зрелая ветвь обрастает парой декоративных веточек — крона живее.
    if (branch && m > 0.55) {
      for (let k = 0; k < 2; k += 1) {
        const t0 = 0.45 + k * 0.22
        branches.push({
          ...buildBranchPath(
            {
              base: pointAt(branch, t0),
              azimuth: azimuth + (hash01(seed, i, k, 11) - 0.5) * 2.4,
              elevation: elevation * 0.6 + 0.35,
              length: length * 0.3,
              radius: radiusAt(branch, t0) * 0.55,
              key: i * 10 + k + 40,
            },
            seed,
          ),
          cluster: -1,
        })
      }
    }
  }

  // Семядоли ростка на верхушке стебля — трогательная деталь раннего сада.
  const tip = pointAt(trunk, 1)
  const cotyledons: LeafSlot[] = [-1, 1].map((side, k) => ({
    cluster: -1,
    local: k,
    // Черешки семядолей выходят из самой верхушки стебля.
    position: new Vector3(tip.x + side * 0.003, tip.y - 0.006, tip.z),
    normal: new Vector3(side * 0.9, 0.45, 0).normalize(),
    size: 1.25,
    phase: k * 1.6,
    lightT: 0.82,
  }))

  return { trunk, branches, slots, cotyledons, clusters, height: h }
}
