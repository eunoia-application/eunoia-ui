import type { Container as PixiContainer, Graphics, Ticker } from 'pixi.js'
import { useEffect, useMemo, useRef, useState } from 'react'

import { MASTERY_META, resolveStatus } from '@entities/mastery'
import type { Band, MasteryStatus, WordLeaf } from '@shared/api'
import { brand, useResolvedTheme } from '@shared/theme'

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
// Почка «Учить» — молодая светло-салатовая. Жёлтый зарезервирован под «забывается».
const BUD_TINT = 0x8ad3a0

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

// Цвет жилок — заметно темнее заливки листа, чтобы прорисовка читалась.
const veinOf = (c: number) => mix(c, 0x0d2417, 0.42)

// Лист «Знаю»: силуэт + центральная и боковые жилки — не сливается с соседями.
function drawLeaf(g: Graphics, s: number, fill: number, vein: number) {
  g.moveTo(0, -9 * s)
    .bezierCurveTo(5 * s, -7 * s, 6.4 * s, -1 * s, 3.2 * s, 5 * s)
    .bezierCurveTo(1.6 * s, 8 * s, 0, 9.4 * s, 0, 9.4 * s)
    .bezierCurveTo(-1.6 * s, 8 * s, -3.2 * s, 5 * s, -6.4 * s, -1 * s)
    .bezierCurveTo(-5 * s, -7 * s, 0, -9 * s, 0, -9 * s)
    .fill(fill)
  g.moveTo(0, 8.4 * s).lineTo(0, -8 * s).stroke({ width: 0.7 * s, color: vein, alpha: 0.5 })
  for (const y of [3.4, 0.6, -2.2]) {
    g.moveTo(0, y * s)
      .lineTo(3.1 * s, (y - 2.6) * s)
      .stroke({ width: 0.5 * s, color: vein, alpha: 0.4 })
    g.moveTo(0, y * s)
      .lineTo(-3.1 * s, (y - 2.6) * s)
      .stroke({ width: 0.5 * s, color: vein, alpha: 0.4 })
  }
}

// Почка «Учить»: набухший округлый бутон с продольной складкой — не раскрытый лист.
function drawBud(g: Graphics, s: number, fill: number, vein: number) {
  g.moveTo(0, -5.4 * s)
    .quadraticCurveTo(4 * s, -4.6 * s, 4 * s, 0.4 * s)
    .quadraticCurveTo(4 * s, 4.6 * s, 0, 5 * s)
    .quadraticCurveTo(-4 * s, 4.6 * s, -4 * s, 0.4 * s)
    .quadraticCurveTo(-4 * s, -4.6 * s, 0, -5.4 * s)
    .fill(fill)
  g.moveTo(0, 4 * s).lineTo(0, -4.6 * s).stroke({ width: 0.6 * s, color: vein, alpha: 0.4 })
}

// --- стадии роста по числу освоенных слов (карта эволюции) ---
const SAPLING_WORDS = 150 // до 150 слов дерево ещё травянистое: росток → молодой побег
const SAP_LEAVES = 20

type Stage =
  | { kind: 'sapling' }
  | { kind: 'tree'; branches: number; glowBoost: number }

/** Архетип и параметры стадии по числу освоенных слов. */
function stageOf(known: number): Stage {
  if (known < SAPLING_WORDS) return { kind: 'sapling' }
  let branches = 3 // молодое дерево 150–400
  if (known >= 400) branches = 4 // дерево 400–1000
  if (known >= 1000) branches = 5 // большое и старше
  const glowBoost = known >= 5000 ? 1.6 : known >= 1000 ? 1.25 : 1
  return { kind: 'tree', branches, glowBoost }
}

/** Размер взрослого дерева: молодое (~0.5) → древо (1.0), лог по словам 150…5000. */
function treeScaleOf(known: number) {
  const lo = Math.log10(SAPLING_WORDS)
  const hi = Math.log10(5000)
  const f = Math.max(
    0,
    Math.min(1, (Math.log10(Math.max(known, SAPLING_WORDS) + 1) - lo) / (hi - lo)),
  )
  return 0.5 + 0.5 * f
}

interface Leaf {
  g: Graphics
  cluster: number
  lightT: number
  s: number
  shape: 'none' | 'leaf' | 'bud'
  fill: number
  baseX: number
  baseY: number
  phase: number
  baseRot: number
  scale: number
  targetScale: number
}

interface SapLeaf {
  g: Graphics
  phase: number
  side: number
  scale: number
  targetScale: number
  isBud?: boolean
}

interface Garden {
  setBands: (bands: Band[]) => void
  setTheme: (dark: boolean) => void
  destroy: () => void
}

interface Handlers {
  onPick: (pick: GardenPick | null) => void
  onSelect: (pick: GardenPick) => void
}

async function createGarden(host: HTMLDivElement, handlers: Handlers): Promise<Garden> {
  const { Application, Container, Graphics, BlurFilter } = await import('pixi.js')

  // Вписываем дерево в контейнер (contain по ширине и высоте) — растёт во весь блок.
  const availW = host.clientWidth || MAX_WIDTH
  const availH = host.clientHeight || (availW * H) / W
  const scale = Math.min(availW / W, availH / H)
  const app = new Application()
  await app.init({
    width: Math.round(W * scale),
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

  // Взрослое дерево и побег — отдельные слои: кроссфейд по стадии.
  const treeLayer: PixiContainer = new Container()
  const sapLayer: PixiContainer = new Container()
  world.addChild(treeLayer)
  world.addChild(sapLayer)
  treeLayer.alpha = 0
  sapLayer.alpha = 0
  // Дерево растёт от земли вверх: якорим масштаб в основании ствола.
  treeLayer.pivot.set(180, 336)
  treeLayer.position.set(180, 336)

  // тёплое закатное свечение за кроной (только тёмная тема)
  const warm = new Graphics().ellipse(180, 116, 150, 120).fill(0xffb070)
  warm.alpha = 0.06
  warm.blendMode = 'add'
  warm.filters = [new BlurFilter({ strength: 30 })]
  treeLayer.addChild(warm)

  // свечение кроны (только тёмная тема)
  const glow = new Graphics().ellipse(180, 128, 132, 116).fill(hex(brand.primary))
  glow.blendMode = 'add'
  glow.filters = [new BlurFilter({ strength: 22 })]
  treeLayer.addChild(glow)

  // тень под деревом
  const shadow = new Graphics().ellipse(180, 336, 82, 12).fill(0x000000)
  shadow.alpha = 0.14
  shadow.filters = [new BlurFilter({ strength: 6 })]
  treeLayer.addChild(shadow)

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
  treeLayer.addChild(roots)

  const trunkDark = new Graphics()
  trunkDark
    .moveTo(169, 338)
    .bezierCurveTo(167, 302, 165, 276, 173, 242)
    .bezierCurveTo(176, 230, 178, 226, 180, 218)
    .bezierCurveTo(182, 226, 184, 230, 187, 242)
    .bezierCurveTo(195, 276, 193, 302, 191, 338)
    .closePath()
    .fill(0x543724)
  treeLayer.addChild(trunkDark)

  const trunkLight = new Graphics()
  trunkLight
    .moveTo(174, 336)
    .bezierCurveTo(173, 304, 171, 278, 177, 244)
    .bezierCurveTo(179, 232, 180, 228, 181, 220)
    .bezierCurveTo(182, 228, 183, 232, 185, 244)
    .bezierCurveTo(190, 278, 188, 304, 186, 336)
    .closePath()
    .fill(0x7f5c3d)
  treeLayer.addChild(trunkLight)

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
  treeLayer.addChild(bark)

  // ветви и тёмная подложка гроздей рисуются по числу активных веток (стадия)
  const branchDark = new Graphics()
  const branchLight = new Graphics()
  const foliage = new Graphics()
  treeLayer.addChild(branchDark)
  treeLayer.addChild(branchLight)
  treeLayer.addChild(foliage)
  const drawStructure = (count: number) => {
    branchDark.clear()
    branchLight.clear()
    foliage.clear()
    for (let i = 0; i < count; i += 1) {
      const c = CLUSTERS[i]
      const w = 8 - i
      const midX = (180 + c.x) / 2
      const midY = (236 + c.y) / 2 + 8
      const ex = c.x
      const ey = c.y + c.r * 0.4
      branchDark
        .moveTo(180, 238)
        .quadraticCurveTo(midX, midY, ex, ey)
        .stroke({ width: w, color: 0x543724, cap: 'round' })
      branchLight
        .moveTo(180, 238)
        .quadraticCurveTo(midX, midY, ex, ey)
        .stroke({ width: w * 0.5, color: 0x7f5c3d, cap: 'round' })
      foliage.ellipse(c.x, c.y, c.r * 0.94, c.r * 0.86).fill(0x1f4e37)
    }
    foliage.alpha = 0.5
  }

  // листья по гроздям (индексы совпадают с buildLeafSpecs — та же раскладка)
  const leavesLayer = new Container()
  treeLayer.addChild(leavesLayer)
  const specs = buildLeafSpecs()
  const leaves: Leaf[] = specs.map((spec, i) => {
    const g = new Graphics()
    const lightT =
      Math.max(0, Math.min(1, (224 - spec.y) / 184)) + (((i * 37) % 100) / 100 - 0.5) * 0.24
    const fill = shade(P_GREEN, lightT)
    drawLeaf(g, spec.s, fill, veinOf(fill))
    g.position.set(spec.x, spec.y)
    const baseRot = ((i * 41) % 360) * (Math.PI / 180)
    g.rotation = baseRot
    g.scale.set(0)
    g.alpha = 0
    leavesLayer.addChild(g)
    return {
      g,
      cluster: spec.cluster,
      lightT,
      s: spec.s,
      shape: 'leaf' as const,
      fill,
      baseX: spec.x,
      baseY: spec.y,
      phase: i * 0.35,
      baseRot,
      scale: 0,
      targetScale: 0,
    }
  })

  // Перекрасить/переформовать лист: «Знаю» — раскрытый лист, «Учить» — почка.
  const applyLeaf = (l: Leaf, shape: 'leaf' | 'bud', fill: number, ts: number) => {
    if (l.shape !== shape || l.fill !== fill) {
      l.g.clear()
      if (shape === 'bud') drawBud(l.g, l.s * 0.85, fill, veinOf(fill))
      else drawLeaf(l.g, l.s, fill, veinOf(fill))
      l.shape = shape
      l.fill = fill
    }
    l.targetScale = ts
  }

  // опадающие листья
  const fallLayer = new Container()
  treeLayer.addChild(fallLayer)
  const particles = Array.from({ length: 12 }, () => {
    const g = new Graphics()
    const pf = hex(brand.primary)
    drawLeaf(g, 0.55, pf, veinOf(pf))
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

  // --- побег: стебель растёт, вдоль него распускаются листочки ---
  const stem = new Graphics()
  sapLayer.addChild(stem)
  let stemTop = 300
  const drawStem = (top: number) => {
    stem.clear()
    stem
      .moveTo(180, 336)
      .bezierCurveTo(179, (336 + top) / 2 + 4, 181, (336 + top) / 2 - 4, 180, top)
      .stroke({ width: 4.2, color: hex(brand.primary), cap: 'round' })
  }
  // семядоли расходятся от вершины стебля (позиция обновляется по мере роста)
  const seedlings: SapLeaf[] = [-1, 1].map((side, k) => {
    const g = new Graphics()
    const sf = shade(P_GREEN, 0.82)
    drawLeaf(g, 1.35, sf, veinOf(sf))
    g.rotation = side * 0.7
    sapLayer.addChild(g)
    return { g, phase: k * 1.6, side, scale: 1, targetScale: 1 }
  })
  // листья вдоль стебля (появляются по мере освоения слов)
  const sapLeaves: SapLeaf[] = Array.from({ length: SAP_LEAVES }, (_, i) => {
    const g = new Graphics()
    const sf = shade(P_GREEN, 0.8)
    drawLeaf(g, 1.35, sf, veinOf(sf))
    const side = i % 2 === 0 ? -1 : 1
    g.rotation = side * 0.9
    g.scale.set(0)
    g.alpha = 0
    sapLayer.addChild(g)
    return { g, phase: i * 0.5, side, scale: 0, targetScale: 0, isBud: false }
  })
  const layoutSapLeaves = (top: number) => {
    const span = 336 - top
    sapLeaves.forEach((sl, i) => {
      const frac = (i + 1) / (SAP_LEAVES + 1)
      const y = 336 - frac * span * 0.94 - 6
      sl.g.position.set(180 + sl.side * (9 + frac * 5), y)
    })
  }

  // --- анимация ---
  let bandCount = 0
  let treeTarget = 0
  let sapTarget = 0
  let treeScaleTarget = 0.5
  let treeScaleCur = 0.5
  let treeInit = false
  let glowBoost = 1
  let t = 0
  const animLeaf = (g: Graphics, cur: number, target: number, phase: number, baseRot: number, bx: number, by: number) => {
    const next = cur + (target - cur) * 0.09
    g.scale.set(next)
    g.alpha = Math.min(1, next * 1.5)
    g.rotation = baseRot + Math.sin(t * 1.4 + phase) * 0.13
    g.position.set(bx + Math.sin(t * 1.1 + phase) * 1.3, by + Math.cos(t * 0.9 + phase) * 0.7)
    return next
  }
  const tick = (ticker: Ticker) => {
    t += ticker.deltaTime * 0.016
    treeLayer.alpha += (treeTarget - treeLayer.alpha) * 0.06
    sapLayer.alpha += (sapTarget - sapLayer.alpha) * 0.06
    treeScaleCur += (treeScaleTarget - treeScaleCur) * 0.05
    treeLayer.scale.set(treeScaleCur)
    for (const l of leaves) {
      if (l.scale < 0.01 && l.targetScale === 0) {
        if (l.g.alpha !== 0) {
          l.g.alpha = 0
          l.g.scale.set(0)
        }
        continue
      }
      l.scale = animLeaf(l.g, l.scale, l.targetScale, l.phase, l.baseRot, l.baseX, l.baseY)
    }
    for (const s of seedlings) {
      s.g.rotation = s.side * 0.7 + Math.sin(t * 1.2 + s.phase) * 0.14
    }
    for (const sl of sapLeaves) {
      if (sl.scale < 0.01 && sl.targetScale === 0) continue
      sl.scale += (sl.targetScale - sl.scale) * 0.1
      sl.g.scale.set(sl.scale)
      sl.g.alpha = Math.min(1, sl.scale * 1.5)
      sl.g.rotation = sl.side * 0.9 + Math.sin(t * 1.3 + sl.phase) * 0.16
    }
    glow.alpha = (0.14 + Math.sin(t * 0.8) * 0.04) * glowBoost
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
  const pickAt = (e: { clientX: number; clientY: number }): GardenPick | null => {
    const rect = app.canvas.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    // Учитываем масштаб роста дерева (якорь в основании 180,336).
    const lx = 180 + (px / scale - 180) / treeScaleCur
    const ly = 336 + (py / scale - 336) / treeScaleCur
    const cluster = hitCluster(lx, ly, bandCount)
    if (cluster === null) return null
    const sx = app.canvas.offsetLeft + px
    const sy = app.canvas.offsetTop + py
    const li = hitLeaf(lx, ly, specs, cluster)
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

  let curBranches = -1
  return {
    setBands(bands) {
      const known = bands.reduce((sum, b) => sum + b.known, 0)
      const learning = bands.reduce((sum, b) => sum + b.learning, 0)
      const marked = known + learning
      const stage = stageOf(known)

      if (stage.kind === 'sapling') {
        // Побег: травянистый стебель растёт, листья распускаются по числу слов.
        sapTarget = 1
        treeTarget = 0
        bandCount = 0
        stemTop = 300 - Math.min(known, SAPLING_WORDS) * 0.4
        drawStem(stemTop)
        seedlings.forEach((s) => s.g.position.set(180 + s.side * 7, stemTop + 2))
        layoutSapLeaves(stemTop)
        sapLeaves.forEach((sl, i) => {
          const shown = i < Math.min(marked, SAP_LEAVES)
          const bud = i >= known && i < marked // сверх известных — почки «Учить»
          sl.targetScale = shown ? (bud ? 0.66 : 1) : 0
          if (shown && sl.isBud !== bud) {
            sl.g.clear()
            const fill = bud ? BUD_TINT : shade(P_GREEN, 0.8)
            if (bud) drawBud(sl.g, 1.15, fill, veinOf(fill))
            else drawLeaf(sl.g, 1.35, fill, veinOf(fill))
            sl.isBud = bud
          }
        })
        return
      }

      // Взрослое дерево: ветви по стадии, крона наполняется живыми листьями.
      sapTarget = 0
      treeTarget = 1
      glowBoost = stage.glowBoost
      const branches = Math.min(stage.branches, bands.length, CLUSTERS.length)
      bandCount = branches
      if (branches !== curBranches) {
        drawStructure(branches)
        curBranches = branches
      }
      treeScaleTarget = treeScaleOf(known)
      if (!treeInit) {
        treeScaleCur = treeScaleTarget
        treeInit = true
      }
      for (let ci = 0; ci < CLUSTERS.length; ci += 1) {
        const band = ci < branches ? bands[ci] : undefined
        const clusterLeaves = leaves.filter((l) => l.cluster === ci)
        const n = clusterLeaves.length
        // Абсолютно: каждое освоенное слово — лист (не доля блока).
        const green = band ? Math.min(band.known, n) : 0
        const buds = band ? Math.min(band.learning, Math.max(0, n - green)) : 0
        clusterLeaves.forEach((l, i) => {
          // «Знаю» — раскрытый лист, «Учить» — почка, остальное — голая ветка.
          if (i < green) applyLeaf(l, 'leaf', shade(P_GREEN, l.lightT), 1)
          else if (i < green + buds) applyLeaf(l, 'bud', BUD_TINT, 0.6)
          else l.targetScale = 0
        })
      }
    },
    setTheme(dark) {
      warm.visible = dark
      glow.visible = dark
      foliage.visible = dark
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
 * Сад на PixiJS: дерево проходит стадии — росток → побег → молодое дерево →
 * дерево → большое → древо, растёт по числу освоенных слов. Крона служит
 * навигацией: наведение на гроздь показывает блок, на лист — слово.
 */
export function GardenTree({ bands, byId, onSelectBand, onSelectWord, loadBandWords }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const gardenRef = useRef<Garden | null>(null)
  const [pick, setPick] = useState<GardenPick | null>(null)
  const [wordsByBand, setWordsByBand] = useState<Record<string, WordLeaf[]>>({})
  const pendingRef = useRef<Set<string>>(new Set())
  const dark = useResolvedTheme() === 'dark'

  const specs = useMemo(() => buildLeafSpecs(), [])
  const counts = useMemo(() => clusterLeafCounts(specs), [specs])

  // Свежие данные и обработчики для колбэков сцены (она создаётся один раз).
  const stateRef = useRef({ bands, wordsByBand, byId, onSelectBand, onSelectWord, loadBandWords, dark })
  stateRef.current = { bands, wordsByBand, byId, onSelectBand, onSelectWord, loadBandWords, dark }

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
        garden.setTheme(stateRef.current.dark)
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
    // Сцена монтируется один раз; данные обновляем отдельными эффектами.
  }, [])

  useEffect(() => {
    gardenRef.current?.setBands(bands)
  }, [bands])

  useEffect(() => {
    gardenRef.current?.setTheme(dark)
  }, [dark])

  const tip = tipFor(pick, bands, wordsByBand, byId)

  return (
    <div
      className="garden-tree"
      style={{ position: 'relative', width: '100%', height: '100%', minHeight: 360 }}
      role="img"
      aria-label="Дерево знаний"
    >
      <div
        ref={hostRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
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
