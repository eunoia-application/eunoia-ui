import type { Graphics, Ticker } from 'pixi.js'
import { useEffect, useMemo, useRef, useState } from 'react'

import { MASTERY_META, resolveStatus } from '@entities/mastery'
import type { Band, MasteryStatus, WordLeaf } from '@shared/api'
import { brand } from '@shared/theme'

import {
  buildLeafSpecs,
  clusterLeafCounts,
  CLUSTERS,
  H,
  hitCluster,
  hitLeaf,
  MAX_WIDTH,
  W,
} from '../lib/scene'

interface Props {
  bands: Band[]
  /** wordId → статус (оверлей отметок) — для подписи листа. */
  byId: Record<string, MasteryStatus>
  /** Клик по грозди — уводит в блок слов. */
  onSelectBand?: (bandId: string) => void
  /** Клик по листу — открывает карточку слова. */
  onSelectWord?: (wordId: string) => void
  /** Ленивая подгрузка слов блока для листьев (первые `limit` по частоте). */
  loadBandWords?: (bandId: string, limit: number) => Promise<WordLeaf[]>
}

/** Что под курсором: гроздь-блок или лист-слово, плюс экранные координаты для тултипа. */
export interface GardenPick {
  kind: 'band' | 'leaf'
  cluster: number
  local: number
  sx: number
  sy: number
}

const hex = (c: string) => parseInt(c.slice(1), 16)

type Palette = { dark: number; mid: number; light: number }
const P_GREEN: Palette = { dark: 0x1e5136, mid: hex(brand.primary), light: 0x63b889 }
const P_YELLOW: Palette = { dark: 0xa8851e, mid: 0xc9a227, light: 0xe6ce73 }
const P_GRAY: Palette = { dark: 0x566158, mid: 0x6e7f76, light: 0x93a29a }

function mix(c1: number, c2: number, t: number) {
  const r = ((c1 >> 16) & 255) + (((c2 >> 16) & 255) - ((c1 >> 16) & 255)) * t
  const g = ((c1 >> 8) & 255) + (((c2 >> 8) & 255) - ((c1 >> 8) & 255)) * t
  const b = (c1 & 255) + ((c2 & 255) - (c1 & 255)) * t
  return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)
}

// Оттенок листа: снизу темнее (тень кроны), сверху светлее (солнце).
function shade(p: Palette, lightT: number) {
  const t = Math.max(0, Math.min(1, lightT))
  return t < 0.5 ? mix(p.dark, p.mid, t * 2) : mix(p.mid, p.light, (t - 0.5) * 2)
}

function drawLeaf(g: Graphics, s: number) {
  g.moveTo(0, -9 * s)
    .bezierCurveTo(5 * s, -7 * s, 6.4 * s, -1 * s, 3.2 * s, 5 * s)
    .bezierCurveTo(1.6 * s, 8 * s, 0, 9.4 * s, 0, 9.4 * s)
    .bezierCurveTo(-1.6 * s, 8 * s, -3.2 * s, 5 * s, -6.4 * s, -1 * s)
    .bezierCurveTo(-5 * s, -7 * s, 0, -9 * s, 0, -9 * s)
    .fill(0xffffff)
}

interface Leaf {
  g: Graphics
  cluster: number
  lightT: number
  baseX: number
  baseY: number
  phase: number
  baseRot: number
  targetAlpha: number
}

interface Garden {
  setBands: (bands: Band[]) => void
  destroy: () => void
}

interface Handlers {
  onPick: (pick: GardenPick | null) => void
  onSelect: (pick: GardenPick) => void
}

async function createGarden(host: HTMLDivElement, handlers: Handlers): Promise<Garden> {
  const { Application, Container, Graphics, BlurFilter } = await import('pixi.js')

  const width = Math.min(host.clientWidth || MAX_WIDTH, MAX_WIDTH)
  const scale = width / W
  const app = new Application()
  await app.init({
    width,
    height: Math.round(H * scale),
    backgroundAlpha: 0,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
  })
  app.canvas.style.display = 'block'
  app.canvas.style.margin = '0 auto'
  host.appendChild(app.canvas)

  const world = new Container()
  world.scale.set(scale)
  app.stage.addChild(world)

  // тёплое закатное свечение за кроной — задаёт атмосферу и глубину
  const warm = new Graphics().ellipse(180, 116, 150, 120).fill(0xffb070)
  warm.alpha = 0.06
  warm.blendMode = 'add'
  warm.filters = [new BlurFilter({ strength: 30 })]
  world.addChild(warm)

  // свечение кроны
  const glow = new Graphics().ellipse(180, 128, 132, 116).fill(hex(brand.primary))
  glow.alpha = 0.17
  glow.blendMode = 'add'
  glow.filters = [new BlurFilter({ strength: 22 })]
  world.addChild(glow)

  // тень под деревом
  const shadow = new Graphics().ellipse(180, 336, 82, 12).fill(0x000000)
  shadow.alpha = 0.14
  shadow.filters = [new BlurFilter({ strength: 6 })]
  world.addChild(shadow)

  // --- ствол: слои дают объём и фактуру коры вместо пластиковой заливки ---
  const roots = new Graphics()
  roots
    .moveTo(174, 332)
    .bezierCurveTo(160, 334, 150, 340, 140, 344)
    .bezierCurveTo(152, 338, 164, 334, 178, 328)
    .fill(0x4c3221)
  roots
    .moveTo(186, 332)
    .bezierCurveTo(200, 334, 210, 340, 220, 344)
    .bezierCurveTo(208, 338, 196, 334, 182, 328)
    .fill(0x4c3221)
  world.addChild(roots)

  const trunkDark = new Graphics()
  trunkDark
    .moveTo(169, 338)
    .bezierCurveTo(167, 302, 165, 276, 173, 242)
    .bezierCurveTo(176, 230, 178, 226, 180, 218)
    .bezierCurveTo(182, 226, 184, 230, 187, 242)
    .bezierCurveTo(195, 276, 193, 302, 191, 338)
    .closePath()
    .fill(0x543724)
  world.addChild(trunkDark)

  const trunkLight = new Graphics()
  trunkLight
    .moveTo(174, 336)
    .bezierCurveTo(173, 304, 171, 278, 177, 244)
    .bezierCurveTo(179, 232, 180, 228, 181, 220)
    .bezierCurveTo(182, 228, 183, 232, 185, 244)
    .bezierCurveTo(190, 278, 188, 304, 186, 336)
    .closePath()
    .fill(0x7f5c3d)
  world.addChild(trunkLight)

  const bark = new Graphics()
  bark
    .moveTo(177, 326)
    .bezierCurveTo(176, 300, 176, 272, 178, 244)
    .stroke({ width: 2, color: 0x9a7552, alpha: 0.45 })
  const grooves: [number, number, number, number][] = [
    [180, 330, 180, 244],
    [183, 326, 184, 248],
    [176, 322, 176, 252],
  ]
  grooves.forEach(([x1, y1, x2, y2]) => {
    bark
      .moveTo(x1, y1)
      .bezierCurveTo(x1 - 1, (y1 + y2) / 2, x2 + 1, (y1 + y2) / 2, x2, y2)
      .stroke({ width: 1.1, color: 0x40291a, alpha: 0.5 })
  })
  world.addChild(bark)

  const branchDark = new Graphics()
  const branchLight = new Graphics()
  CLUSTERS.forEach((c, i) => {
    const w = 8 - i
    const midX = (180 + c.x) / 2
    const midY = (236 + c.y) / 2 + 8
    const ex = c.x
    const ey = c.y + c.r * 0.4
    branchDark.moveTo(180, 238).quadraticCurveTo(midX, midY, ex, ey).stroke({
      width: w,
      color: 0x543724,
      cap: 'round',
    })
    branchLight.moveTo(180, 238).quadraticCurveTo(midX, midY, ex, ey).stroke({
      width: w * 0.5,
      color: 0x7f5c3d,
      cap: 'round',
    })
  })
  world.addChild(branchDark)
  world.addChild(branchLight)

  // тёмная подложка гроздей — объём и тень внутри кроны
  const foliage = new Graphics()
  CLUSTERS.forEach((c) => foliage.ellipse(c.x, c.y, c.r * 0.94, c.r * 0.86).fill(0x1f4e37))
  foliage.alpha = 0.5
  foliage.filters = [new BlurFilter({ strength: 5 })]
  world.addChild(foliage)

  // листья по гроздям (индексы совпадают с buildLeafSpecs — та же раскладка)
  const leavesLayer = new Container()
  world.addChild(leavesLayer)
  const specs = buildLeafSpecs()
  const leaves: Leaf[] = specs.map((spec, i) => {
    const g = new Graphics()
    drawLeaf(g, spec.s)
    g.position.set(spec.x, spec.y)
    const baseRot = ((i * 41) % 360) * (Math.PI / 180)
    g.rotation = baseRot
    const lightT =
      Math.max(0, Math.min(1, (224 - spec.y) / 184)) + (((i * 37) % 100) / 100 - 0.5) * 0.24
    g.tint = shade(P_GRAY, lightT)
    g.alpha = 0.26
    leavesLayer.addChild(g)
    return {
      g,
      cluster: spec.cluster,
      lightT,
      baseX: spec.x,
      baseY: spec.y,
      phase: i * 0.35,
      baseRot,
      targetAlpha: 0.26,
    }
  })

  // опадающие листья
  const fallLayer = new Container()
  world.addChild(fallLayer)
  const particles = Array.from({ length: 12 }, () => {
    const g = new Graphics()
    drawLeaf(g, 0.55)
    g.tint = hex(brand.primary)
    fallLayer.addChild(g)
    return {
      g,
      x: 40 + Math.random() * (W - 80),
      y: Math.random() * H,
      vy: 0.28 + Math.random() * 0.45,
      drift: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.05,
      alpha: 0.22 + Math.random() * 0.38,
    }
  })

  let t = 0
  const tick = (ticker: Ticker) => {
    t += ticker.deltaTime * 0.016
    for (const l of leaves) {
      l.g.rotation = l.baseRot + Math.sin(t * 1.4 + l.phase) * 0.13
      l.g.position.x = l.baseX + Math.sin(t * 1.1 + l.phase) * 1.3
      l.g.position.y = l.baseY + Math.cos(t * 0.9 + l.phase) * 0.7
      if (Math.abs(l.g.alpha - l.targetAlpha) > 0.005) {
        l.g.alpha += (l.targetAlpha - l.g.alpha) * 0.06
      }
    }
    glow.alpha = 0.14 + Math.sin(t * 0.8) * 0.04
    for (const p of particles) {
      p.y += p.vy
      p.x += Math.sin(t + p.drift) * 0.28
      p.g.rotation += p.spin
      p.g.position.set(p.x, p.y)
      p.g.alpha = p.alpha
      if (p.y > H + 12) {
        p.y = -12
        p.x = 40 + Math.random() * (W - 80)
      }
    }
  }
  app.ticker.add(tick)

  // --- интерактив: наведение и клик по кроне ---
  let bandCount = 0
  const pickAt = (e: { clientX: number; clientY: number }): GardenPick | null => {
    const rect = app.canvas.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    const cluster = hitCluster(px / scale, py / scale, bandCount)
    if (cluster === null) return null
    const sx = app.canvas.offsetLeft + px
    const sy = app.canvas.offsetTop + py
    const li = hitLeaf(px / scale, py / scale, specs, cluster)
    return li !== null
      ? { kind: 'leaf', cluster, local: specs[li].local, sx, sy }
      : { kind: 'band', cluster, local: -1, sx, sy }
  }
  const onMove = (e: PointerEvent) => {
    const pick = pickAt(e)
    app.canvas.style.cursor = pick ? 'pointer' : 'default'
    handlers.onPick(pick)
  }
  const onLeave = () => {
    app.canvas.style.cursor = 'default'
    handlers.onPick(null)
  }
  const onClick = (e: MouseEvent) => {
    const pick = pickAt(e)
    if (pick) handlers.onSelect(pick)
  }
  app.canvas.addEventListener('pointermove', onMove)
  app.canvas.addEventListener('pointerleave', onLeave)
  app.canvas.addEventListener('click', onClick)

  return {
    setBands(bands) {
      bandCount = Math.min(bands.length, CLUSTERS.length)
      for (let ci = 0; ci < CLUSTERS.length; ci += 1) {
        const band = bands[ci]
        const clusterLeaves = leaves.filter((l) => l.cluster === ci)
        const n = clusterLeaves.length
        const green = band && band.total ? Math.round((band.known / band.total) * n) : 0
        const yellow = band && band.total ? Math.round((band.learning / band.total) * n) : 0
        clusterLeaves.forEach((l, i) => {
          if (i < green) {
            l.g.tint = shade(P_GREEN, l.lightT)
            l.targetAlpha = 1
          } else if (i < green + yellow) {
            l.g.tint = shade(P_YELLOW, l.lightT)
            l.targetAlpha = 1
          } else {
            l.g.tint = shade(P_GRAY, l.lightT)
            l.targetAlpha = 0.26
          }
        })
      }
    },
    destroy() {
      app.canvas.removeEventListener('pointermove', onMove)
      app.canvas.removeEventListener('pointerleave', onLeave)
      app.canvas.removeEventListener('click', onClick)
      app.ticker.remove(tick)
      app.destroy(true, { children: true, texture: true })
    },
  }
}

interface Tip {
  title: string
  sub: string
  color?: string
  sx: number
  sy: number
}

/**
 * Сад на PixiJS: крона зеленеет по блокам, а сама служит навигацией —
 * наведение на гроздь показывает блок, на лист — слово; клик уводит вглубь.
 */
export function GardenTree({ bands, byId, onSelectBand, onSelectWord, loadBandWords }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const gardenRef = useRef<Garden | null>(null)
  const [pick, setPick] = useState<GardenPick | null>(null)
  const [wordsByBand, setWordsByBand] = useState<Record<string, WordLeaf[]>>({})
  const pendingRef = useRef<Set<string>>(new Set())

  const specs = useMemo(() => buildLeafSpecs(), [])
  const counts = useMemo(() => clusterLeafCounts(specs), [specs])

  // Свежие данные и обработчики для колбэков сцены (она создаётся один раз).
  const stateRef = useRef({ bands, wordsByBand, byId, onSelectBand, onSelectWord, loadBandWords })
  stateRef.current = { bands, wordsByBand, byId, onSelectBand, onSelectWord, loadBandWords }

  const ensureWords = (cluster: number) => {
    const { bands, wordsByBand, loadBandWords } = stateRef.current
    const band = bands[cluster]
    if (!band || !loadBandWords) return
    if (wordsByBand[band.id] || pendingRef.current.has(band.id)) return
    pendingRef.current.add(band.id)
    loadBandWords(band.id, counts[cluster])
      .then((ws) => setWordsByBand((prev) => ({ ...prev, [band.id]: ws })))
      .catch(() => undefined)
      .finally(() => pendingRef.current.delete(band.id))
  }

  const handlePick = (p: GardenPick | null) => {
    setPick(p)
    if (p) ensureWords(p.cluster)
  }

  const handleSelect = (p: GardenPick) => {
    const { bands, wordsByBand, onSelectBand, onSelectWord } = stateRef.current
    const band = bands[p.cluster]
    if (!band) return
    const word = p.kind === 'leaf' ? wordsByBand[band.id]?.[p.local] : undefined
    if (word) onSelectWord?.(word.id)
    else onSelectBand?.(band.id)
  }

  const pickRef = useRef(handlePick)
  pickRef.current = handlePick
  const selectRef = useRef(handleSelect)
  selectRef.current = handleSelect

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let disposed = false
    void createGarden(host, {
      onPick: (p) => pickRef.current(p),
      onSelect: (p) => selectRef.current(p),
    })
      .then((garden) => {
        if (disposed) {
          garden.destroy()
          return
        }
        gardenRef.current = garden
        garden.setBands(stateRef.current.bands)
      })
      .catch(() => undefined)
    return () => {
      disposed = true
      gardenRef.current?.destroy()
      gardenRef.current = null
      setPick(null)
      host.replaceChildren()
    }
    // Сцена монтируется один раз; данные обновляем отдельным эффектом.
  }, [])

  useEffect(() => {
    gardenRef.current?.setBands(bands)
  }, [bands])

  const tip = tipFor(pick, bands, wordsByBand, byId)

  return (
    <div
      className="garden-tree"
      style={{ position: 'relative', width: '100%', minHeight: 320 }}
      role="img"
      aria-label="Дерево знаний"
    >
      <div ref={hostRef} />
      {tip ? (
        <div
          className="garden-tip"
          style={{
            position: 'absolute',
            left: tip.sx,
            top: tip.sy,
            transform: 'translate(-50%, calc(-100% - 12px))',
            pointerEvents: 'none',
            padding: '7px 12px',
            borderRadius: 10,
            background: 'rgba(20, 32, 26, 0.92)',
            color: '#fff',
            whiteSpace: 'nowrap',
            fontSize: 13,
            lineHeight: 1.35,
            boxShadow: '0 6px 20px rgba(0,0,0,0.28)',
            zIndex: 5,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600 }}>
            {tip.color ? (
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: tip.color,
                  flexShrink: 0,
                }}
              />
            ) : null}
            {tip.title}
          </div>
          <div style={{ opacity: 0.75, fontSize: 12 }}>{tip.sub}</div>
        </div>
      ) : null}
    </div>
  )
}

function tipFor(
  pick: GardenPick | null,
  bands: Band[],
  wordsByBand: Record<string, WordLeaf[]>,
  byId: Record<string, MasteryStatus>,
): Tip | null {
  if (!pick) return null
  const band = bands[pick.cluster]
  if (!band) return null
  if (pick.kind === 'leaf') {
    const word = wordsByBand[band.id]?.[pick.local]
    if (word) {
      const status = resolveStatus(word.id, word.status, byId)
      const meta = MASTERY_META[status]
      return { title: word.lemma, sub: meta.label, color: meta.color, sx: pick.sx, sy: pick.sy }
    }
  }
  return {
    title: band.label,
    sub: `${band.known} / ${band.total} освоено`,
    sx: pick.sx,
    sy: pick.sy,
  }
}
