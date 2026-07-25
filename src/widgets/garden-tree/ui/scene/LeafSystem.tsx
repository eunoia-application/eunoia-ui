import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  Color,
  DoubleSide,
  LatheGeometry,
  Matrix4,
  Quaternion,
  SphereGeometry,
  Vector2,
  Vector3,
  type InstancedMesh,
} from 'three'

import type { Band } from '@shared/api'

import {
  CLUSTER_CAPACITY,
  CLUSTER_OFFSETS,
  FRUITS_PER_BRANCH,
  MAX_BRANCHES,
  SLOT_TOTAL,
} from '../../lib/constants'
import { buildLeafGeometry } from '../../lib/leafGeometry'
import { TAU, hash01, smoothstep } from '../../lib/math'
import { FRUIT_COLOR, leafShade } from '../../lib/palette'
import {
  branchMaturity,
  clusterFill,
  isBandComplete,
  type GrowthState,
  type TreeDims,
} from '../../model/growth'
import type { LeafSlot, TreeSkeleton } from '../../model/skeleton'
import type { GardenPick } from '../GardenTree'
import { getBudTexture, getLeafTexture } from './textures'
import { windOffsetAt, type WindUniforms } from './useWind'

interface Props {
  skeleton: TreeSkeleton
  /** Текущие (анимируемые) размеры — мировой размер листа. */
  dims: TreeDims
  bands: Band[]
  growth: GrowthState
  calm: boolean
  wind: WindUniforms
  onPick: (pick: GardenPick | null) => void
  onSelect: (pick: GardenPick) => void
}

const LEAF_COUNT = SLOT_TOTAL + 2 // + семядоли ростка
const FRUIT_COUNT = MAX_BRANCHES * FRUITS_PER_BRANCH
const UP = new Vector3(0, 1, 0)

const tmpM = new Matrix4()
const tmpQ = new Quaternion()
const tmpSpin = new Quaternion()
const tmpP = new Vector3()
const tmpS = new Vector3()
const tmpW = new Vector3()

/** Индекс слота → грозди (обратное к offset + local). */
function clusterOf(slotIndex: number): number {
  for (let c = MAX_BRANCHES - 1; c >= 0; c -= 1) {
    if (slotIndex >= CLUSTER_OFFSETS[c]) return c
  }
  return 0
}

/**
 * Крона: каждый лист — слово (InstancedMesh, свой размер/оттенок/фаза),
 * почки — «Учить», плоды зреют на полностью освоенных ветках. Сферы гроздей
 * ловят наведение: лист (и почка) в приоритете, иначе — ветка-блок.
 */
export function LeafSystem({ skeleton, dims, bands, growth, calm, wind, onPick, onSelect }: Props) {
  const leavesRef = useRef<InstancedMesh>(null)
  const budsRef = useRef<InstancedMesh>(null)
  const fruitsRef = useRef<InstancedMesh>(null)

  const leafGeo = useMemo(() => buildLeafGeometry(), [])
  const budGeo = useMemo(() => {
    // Набухшая почка: профиль-капля с заострённым кончиком (не горошина).
    const profile = [
      [0, 0],
      [0.16, 0.04],
      [0.27, 0.14],
      [0.33, 0.3],
      [0.3, 0.48],
      [0.21, 0.64],
      [0.1, 0.78],
      [0.028, 0.88],
      [0, 0.94],
    ].map(([x, y]) => new Vector2(x, y))
    const g = new LatheGeometry(profile, 10)
    // База чуть утоплена в кору — почка сидит на ветке, а не парит рядом.
    g.translate(0, -0.04, 0)
    return g
  }, [])
  const fruitGeo = useMemo(() => new SphereGeometry(0.5, 10, 10), [])
  useEffect(
    () => () => {
      leafGeo.dispose()
      budGeo.dispose()
      fruitGeo.dispose()
    },
    [leafGeo, budGeo, fruitGeo],
  )

  // Слот-инстанс: постоянный индекс offset[cluster] + local — скелет может
  // перестраиваться, а анимируемые масштабы листьев живут дальше.
  const slotByIndex = useMemo(() => {
    const arr: (LeafSlot | null)[] = Array.from({ length: LEAF_COUNT }, () => null)
    for (const s of skeleton.slots) arr[CLUSTER_OFFSETS[s.cluster] + s.local] = s
    skeleton.cotyledons.forEach((s, k) => {
      arr[SLOT_TOTAL + k] = s
    })
    return arr
  }, [skeleton])

  const baseQuats = useMemo(
    () =>
      slotByIndex.map((s) => {
        if (!s) return null
        const q = new Quaternion().setFromUnitVectors(UP, s.normal)
        return q.multiply(new Quaternion().setFromAxisAngle(UP, s.phase))
      }),
    [slotByIndex],
  )

  // Позиции плодов — нижняя полусфера грозди (плод висит под листвой).
  const fruitSpots = useMemo(
    () =>
      skeleton.clusters.flatMap((zone, c) =>
        Array.from({ length: FRUITS_PER_BRANCH }, (_, f) => {
          const a = hash01(c, f, 21) * TAU
          const r = zone.radius * (0.3 + 0.3 * hash01(c, f, 22))
          return new Vector3(
            zone.center.x + Math.cos(a) * r,
            zone.center.y - zone.radius * (0.15 + 0.25 * hash01(c, f, 23)),
            zone.center.z + Math.sin(a) * r,
          )
        }),
      ),
    [skeleton],
  )

  // Целевые состояния: лист «Знаю», почка «Учить», пусто — голая ветка.
  const anim = useRef({
    leafScales: new Float32Array(LEAF_COUNT),
    budScales: new Float32Array(SLOT_TOTAL),
    fruitScales: new Float32Array(FRUIT_COUNT),
    leafTargets: new Float32Array(LEAF_COUNT),
    budTargets: new Float32Array(SLOT_TOTAL),
    fruitTargets: new Float32Array(FRUIT_COUNT),
  })
  useEffect(() => {
    const a = anim.current
    for (let c = 0; c < MAX_BRANCHES; c += 1) {
      const { leaves, buds } = clusterFill(bands[c], c)
      for (let k = 0; k < CLUSTER_CAPACITY[c]; k += 1) {
        const i = CLUSTER_OFFSETS[c] + k
        a.leafTargets[i] = k < leaves ? 1 : 0
        a.budTargets[i] = k >= leaves && k < leaves + buds ? 1 : 0
      }
      // Плоды зреют только на зрелой ветви — росток не плодоносит.
      const ripe = isBandComplete(bands[c]) && branchMaturity(growth.progress, c) > 0.6
      for (let f = 0; f < FRUITS_PER_BRANCH; f += 1) {
        a.fruitTargets[c * FRUITS_PER_BRANCH + f] = ripe ? 1 : 0
      }
    }
    // Семядоли исчезают по мере одревеснения ростка.
    const cot = 1 - smoothstep(0.28, 0.5, growth.progress)
    a.leafTargets[SLOT_TOTAL] = cot
    a.leafTargets[SLOT_TOTAL + 1] = cot
  }, [bands, growth.progress])

  // Цвета инстансов: оттенок листа по свету кроны, плоды — константа.
  // Почки не красим — их настоящие цвета (коричневое основание → зелень)
  // запечены в текстуре градиентом.
  useEffect(() => {
    const leaves = leavesRef.current
    const fruits = fruitsRef.current
    if (!leaves || !fruits) return
    const c = new Color()
    slotByIndex.forEach((s, i) => {
      const shade = leafShade(s ? s.lightT : 0.8)
      leaves.setColorAt(i, c.setRGB(shade.r, shade.g, shade.b))
    })
    for (let i = 0; i < FRUIT_COUNT; i += 1) fruits.setColorAt(i, c.set(FRUIT_COLOR))
    if (leaves.instanceColor) leaves.instanceColor.needsUpdate = true
    if (fruits.instanceColor) fruits.instanceColor.needsUpdate = true
  }, [slotByIndex])

  const hoveredRef = useRef<{ cluster: number; local: number } | null>(null)

  useFrame((state, dt) => {
    const leaves = leavesRef.current
    const buds = budsRef.current
    const fruits = fruitsRef.current
    if (!leaves || !buds || !fruits) return
    const t = state.clock.elapsedTime
    const k = Math.min(1, dt * 5)
    const flutterAmp = calm ? 0.02 : 0.09
    const a = anim.current
    const hov = hoveredRef.current
    const hovIndex = hov ? CLUSTER_OFFSETS[hov.cluster] + hov.local : -1
    const maxY = skeleton.height

    for (let i = 0; i < LEAF_COUNT; i += 1) {
      a.leafScales[i] += (a.leafTargets[i] - a.leafScales[i]) * k
      const slot = slotByIndex[i]
      const q = baseQuats[i]
      const boost = i === hovIndex ? 1.35 : 1
      const s = slot ? a.leafScales[i] * slot.size * dims.leafSize * boost : 0
      // Точка крепления едет вместе с деревом — та же формула ветра, что гнёт
      // ствол в шейдере; собственный трепет — только поворот вокруг черешка.
      const sway = slot ? windOffsetAt(slot.position.y, maxY, wind, tmpW) : tmpW.set(0, 0, 0)
      if (!slot || !q || s < 0.002) {
        tmpM.makeScale(0, 0, 0)
        leaves.setMatrixAt(i, tmpM)
      } else {
        tmpSpin.setFromAxisAngle(UP, Math.sin(t * 1.3 + slot.phase) * flutterAmp)
        tmpQ.copy(q).multiply(tmpSpin)
        tmpP.copy(slot.position).add(sway)
        leaves.setMatrixAt(i, tmpM.compose(tmpP, tmpQ, tmpS.setScalar(s)))
      }
      if (i < SLOT_TOTAL) {
        a.budScales[i] += (a.budTargets[i] - a.budScales[i]) * k
        const bs = slot ? a.budScales[i] * slot.size * dims.leafSize * 0.6 * boost : 0
        if (!slot || !q || bs < 0.002) {
          tmpM.makeScale(0, 0, 0)
          buds.setMatrixAt(i, tmpM)
        } else {
          tmpQ.copy(q)
          tmpP.copy(slot.position).add(sway)
          buds.setMatrixAt(i, tmpM.compose(tmpP, tmpQ, tmpS.setScalar(bs)))
        }
      }
    }
    for (let i = 0; i < FRUIT_COUNT; i += 1) {
      a.fruitScales[i] += (a.fruitTargets[i] - a.fruitScales[i]) * Math.min(1, dt * 2.5)
      const spot = fruitSpots[i]
      const fs = spot ? a.fruitScales[i] * dims.leafSize * 0.6 : 0
      if (!spot || fs < 0.002) {
        tmpM.makeScale(0, 0, 0)
        fruits.setMatrixAt(i, tmpM)
      } else {
        tmpP.copy(spot).add(windOffsetAt(spot.y, maxY, wind, tmpW))
        tmpP.y += Math.sin(t * 0.9 + i) * 0.006
        fruits.setMatrixAt(i, tmpM.compose(tmpP, tmpQ.identity(), tmpS.setScalar(fs)))
      }
    }
    leaves.instanceMatrix.needsUpdate = true
    buds.instanceMatrix.needsUpdate = true
    fruits.instanceMatrix.needsUpdate = true
  })

  // Наведение/клик: слово (лист или почка) в приоритете, иначе — ветка-блок.
  const resolvePick = (e: ThreeEvent<PointerEvent | MouseEvent>, cluster: number): GardenPick => {
    const a = anim.current
    const hit = e.intersections.find(
      (it) =>
        (it.object === leavesRef.current || it.object === budsRef.current) &&
        it.instanceId != null &&
        it.instanceId < SLOT_TOTAL &&
        (it.object === leavesRef.current
          ? a.leafScales[it.instanceId]
          : a.budScales[it.instanceId]) > 0.05,
    )
    const sx = e.nativeEvent.clientX
    const sy = e.nativeEvent.clientY
    if (hit?.instanceId != null) {
      const c = clusterOf(hit.instanceId)
      return { kind: 'leaf', cluster: c, local: hit.instanceId - CLUSTER_OFFSETS[c], sx, sy }
    }
    return { kind: 'band', cluster, local: -1, sx, sy }
  }

  const handleMove = (e: ThreeEvent<PointerEvent>, cluster: number) => {
    e.stopPropagation()
    const pick = resolvePick(e, cluster)
    hoveredRef.current = pick.kind === 'leaf' ? { cluster: pick.cluster, local: pick.local } : null
    onPick(pick)
  }
  const handleOut = () => {
    hoveredRef.current = null
    onPick(null)
  }
  const handleClick = (e: ThreeEvent<MouseEvent>, cluster: number) => {
    e.stopPropagation()
    onSelect(resolvePick(e, cluster))
  }

  return (
    <group>
      <instancedMesh ref={leavesRef} args={[leafGeo, undefined, LEAF_COUNT]} frustumCulled={false}>
        <meshStandardMaterial
          map={getLeafTexture()}
          side={DoubleSide}
          roughness={0.55}
          metalness={0}
        />
      </instancedMesh>
      <instancedMesh ref={budsRef} args={[budGeo, undefined, SLOT_TOTAL]} frustumCulled={false}>
        <meshStandardMaterial map={getBudTexture()} roughness={0.5} metalness={0} />
      </instancedMesh>
      <instancedMesh ref={fruitsRef} args={[fruitGeo, undefined, FRUIT_COUNT]} frustumCulled={false}>
        <meshStandardMaterial roughness={0.35} metalness={0} />
      </instancedMesh>
      {skeleton.clusters.map((zone, i) =>
        bands[i] ? (
          <mesh
            key={i}
            position={zone.center}
            onPointerMove={(e) => handleMove(e, i)}
            onPointerOut={handleOut}
            onClick={(e) => handleClick(e, i)}
          >
            <sphereGeometry args={[zone.radius * 1.08, 12, 10]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        ) : null,
      )}
    </group>
  )
}
