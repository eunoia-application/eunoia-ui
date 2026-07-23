import { AutoComplete, Input } from 'antd'
import { useEffect, useState } from 'react'

import { lexemeApi } from '@entities/lexeme'
import type { LexemeRef } from '@shared/api'
import { useDebouncedValue } from '@shared/lib'

interface Props {
  onPick: (lexemeId: string) => void
}

/** Поиск слова по префиксу леммы: debounce + подсказки из графа знаний. */
export function LexemeSearch({ onPick }: Props) {
  const [query, setQuery] = useState('')
  const [refs, setRefs] = useState<LexemeRef[]>([])
  const debounced = useDebouncedValue(query)

  useEffect(() => {
    const q = debounced.trim()
    if (!q) {
      setRefs([])
      return
    }

    let cancelled = false
    lexemeApi
      .search(q, 10)
      .then((found) => {
        if (!cancelled) setRefs(found)
      })
      .catch(() => {
        // Подсказки — вспомогательный сценарий: молча показываем пустой список.
        if (!cancelled) setRefs([])
      })

    return () => {
      cancelled = true
    }
  }, [debounced])

  return (
    <AutoComplete
      value={query}
      onChange={setQuery}
      onSelect={(value: string) => {
        onPick(value)
        setQuery('')
        setRefs([])
      }}
      options={refs.map((ref) => ({ value: ref.id, label: ref.lemma }))}
      style={{ width: '100%', maxWidth: 340 }}
    >
      <Input.Search placeholder="Найти слово" allowClear size="large" />
    </AutoComplete>
  )
}
