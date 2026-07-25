// ВРЕМЕННАЯ dev-песочница для визуальной проверки дерева (не коммитить).
import { useState } from 'react'

import type { Band } from '@shared/api'
import { useResolvedTheme, useThemeStore } from '@shared/theme'
import { GardenTree } from '@widgets/garden-tree'

const mk = (i: number, known: number, learning: number, total = 1000): Band => ({
  id: `band-${i}`,
  label: `Топ-${(i + 1) * 100}`,
  fromRank: i * 100 + 1,
  toRank: (i + 1) * 100,
  total,
  known,
  learning,
})

function bandsFor(words: number): Band[] {
  const per = [0.45, 0.25, 0.15, 0.1, 0.05]
  return per.map((f, i) => {
    const known = Math.round(words * f)
    const total = i === 0 ? Math.max(1, known) : 1000
    return mk(i, known, Math.round(Math.min(20, words * f * 0.3)), total)
  })
}

export default function GardenLab() {
  const [words, setWords] = useState(400)
  const dark = useResolvedTheme() === 'dark'
  const toggle = useThemeStore((s) => s.toggle)
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        // Фон как у приложения: дерево живёт на странице, без своей подложки.
        background: dark ? '#141414' : '#ffffff',
      }}
    >
      <div style={{ padding: 12, display: 'flex', gap: 12, alignItems: 'center', zIndex: 10 }}>
        <input
          type="range"
          min={0}
          max={5000}
          value={words}
          onChange={(e) => setWords(Number(e.target.value))}
          style={{ width: 320 }}
        />
        <span style={{ color: dark ? '#fff' : '#000' }}>{words} слов</span>
        <button onClick={toggle}>{dark ? 'light' : 'dark'}</button>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <GardenTree bands={bandsFor(words)} byId={{}} loadBandWords={() => Promise.resolve([])} />
      </div>
    </div>
  )
}
