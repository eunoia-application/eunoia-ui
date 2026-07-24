import { AutoComplete, Input } from 'antd'
import { useEffect, useState } from 'react'

import { POS_SHORT, wordApi } from '@entities/word'
import type { WordRef } from '@shared/api'
import { useDebouncedValue } from '@shared/lib'

interface Props {
  onPick: (wordId: string) => void
}

/** Поиск слова по префиксу леммы: debounce + подсказки с частью речи. */
export function WordSearch({ onPick }: Props) {
  const [query, setQuery] = useState('')
  const [refs, setRefs] = useState<WordRef[]>([])
  const debounced = useDebouncedValue(query)

  useEffect(() => {
    const q = debounced.trim()
    if (!q) {
      setRefs([])
      return
    }

    let cancelled = false
    wordApi
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
      filterOption={false}
      options={refs.map((ref) => ({
        value: ref.id,
        label: ref.pos ? `${ref.lemma} · ${POS_SHORT[ref.pos]}` : ref.lemma,
      }))}
      style={{ width: '100%', maxWidth: 340 }}
    >
      <Input.Search placeholder="Найти слово" allowClear size="large" />
    </AutoComplete>
  )
}
