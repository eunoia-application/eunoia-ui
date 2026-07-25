import { Component, Suspense, lazy, useRef, useState, type ReactNode } from 'react'

import { MASTERY_META, resolveStatus } from '@entities/mastery'
import type { Band, MasteryStatus, WordLeaf } from '@shared/api'
import { useMediaQuery } from '@shared/lib'
import { useResolvedTheme } from '@shared/theme'

import { CLUSTER_CAPACITY } from '../lib/constants'
import { useTreeGrowth } from '../model/useTreeGrowth'

const GardenCanvas = lazy(() => import('./scene/GardenCanvas'))

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

/** Что под курсором: гроздь-блок или лист-слово, плюс клиентские координаты. */
export interface GardenPick {
  kind: 'band' | 'leaf'
  cluster: number
  local: number
  sx: number
  sy: number
}

interface Tip {
  title: string
  sub: string
  color?: string
  sx: number
  sy: number
}

/** WebGL может быть недоступен — сад тогда молча уступает место странице. */
class CanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/**
 * Сад на React Three Fiber: живое 3D-дерево растёт непрерывно по числу
 * освоенных слов. Крона — навигация: наведение на гроздь показывает блок,
 * на лист — слово; клик открывает раздел или карточку.
 */
export function GardenTree({ bands, byId, onSelectBand, onSelectWord, loadBandWords }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [pick, setPick] = useState<GardenPick | null>(null)
  const [wordsByBand, setWordsByBand] = useState<Record<string, WordLeaf[]>>({})
  const pendingRef = useRef<Set<string>>(new Set())
  const dark = useResolvedTheme() === 'dark'
  const calm = useMediaQuery('(prefers-reduced-motion: reduce)')
  const growth = useTreeGrowth(bands)

  // Свежие данные для колбэков сцены — сами колбэки стабильны по ссылке.
  const stateRef = useRef({ bands, wordsByBand, onSelectBand, onSelectWord, loadBandWords })
  stateRef.current = { bands, wordsByBand, onSelectBand, onSelectWord, loadBandWords }

  const ensureWords = (cluster: number) => {
    const { bands, wordsByBand, loadBandWords } = stateRef.current
    const band = bands[cluster]
    if (!band || !loadBandWords) return
    if (wordsByBand[band.id] || pendingRef.current.has(band.id)) return
    pendingRef.current.add(band.id)
    loadBandWords(band.id, CLUSTER_CAPACITY[cluster])
      .then((ws) => setWordsByBand((prev) => ({ ...prev, [band.id]: ws })))
      .catch(() => undefined)
      .finally(() => pendingRef.current.delete(band.id))
  }

  const handlePick = (p: GardenPick | null) => {
    // Клиентские координаты указателя → локальные для тултипа.
    const rect = hostRef.current?.getBoundingClientRect()
    setPick(p && rect ? { ...p, sx: p.sx - rect.left, sy: p.sy - rect.top } : p)
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
  const stablePick = useRef((p: GardenPick | null) => pickRef.current(p)).current
  const stableSelect = useRef((p: GardenPick) => selectRef.current(p)).current

  const tip = tipFor(pick, bands, wordsByBand, byId)

  return (
    <div
      ref={hostRef}
      className="garden-tree"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 360,
        cursor: pick ? 'pointer' : 'default',
      }}
      role="img"
      aria-label="Дерево знаний"
    >
      <CanvasBoundary>
        <Suspense fallback={null}>
          <GardenCanvas
            bands={bands}
            growth={growth}
            dark={dark}
            calm={calm}
            onPick={stablePick}
            onSelect={stableSelect}
          />
        </Suspense>
      </CanvasBoundary>
      {tip ? (
        <div
          className="garden-tip"
          style={{
            position: 'absolute',
            left: tip.sx,
            top: tip.sy,
            transform: 'translate(-50%, calc(-100% - 14px))',
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
