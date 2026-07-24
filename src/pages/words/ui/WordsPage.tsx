import { Flex } from 'antd'
import { useEffect, useState } from 'react'

import { useBandStore } from '@entities/band'
import { useMasteryStore } from '@entities/mastery'
import { useWordStore } from '@entities/word'
import { WordSearch } from '@features/search-words'
import { PageHeader } from '@shared/ui'
import { BandList } from '@widgets/bands'
import { WordModal } from '@widgets/word-modal'
import { WordList } from '@widgets/words'

/** Слова: блоки топ-слов по частоте → слова блока (по темам) → карточка. */
export function WordsPage() {
  const bands = useBandStore((state) => state.bands)
  const bandsStatus = useBandStore((state) => state.status)
  const bandsError = useBandStore((state) => state.error)
  const fetchBands = useBandStore((state) => state.fetchBands)

  const band = useWordStore((state) => state.band)
  const words = useWordStore((state) => state.words)
  const total = useWordStore((state) => state.total)
  const listStatus = useWordStore((state) => state.listStatus)
  const listError = useWordStore((state) => state.listError)
  const selectBand = useWordStore((state) => state.selectBand)
  const loadMore = useWordStore((state) => state.loadMore)

  const fetchMine = useMasteryStore((state) => state.fetchMine)

  const [openWordId, setOpenWordId] = useState<string | null>(null)

  useEffect(() => {
    void fetchBands()
    void fetchMine()
  }, [fetchBands, fetchMine])

  // Первый блок раскрывается сам — раздел не встречает пустотой.
  useEffect(() => {
    if (band === null && bands.length) void selectBand(bands[0].id)
  }, [bands, band, selectBand])

  return (
    <>
      <PageHeader
        title="Слова"
        description="Учите слова блоками по частоте: отмечайте «Знаю» и «Учить»."
      />

      <Flex vertical gap={20}>
        <WordSearch onPick={setOpenWordId} />

        <BandList
          bands={bands}
          status={bandsStatus}
          error={bandsError}
          activeId={band}
          onSelect={(id) => void selectBand(id)}
          onRetry={() => void fetchBands()}
        />

        {band !== null && (
          <WordList
            words={words}
            total={total}
            status={listStatus}
            error={listError}
            onOpen={setOpenWordId}
            onLoadMore={() => void loadMore()}
            onRetry={() => void selectBand(band)}
          />
        )}
      </Flex>

      <WordModal
        wordId={openWordId}
        onClose={() => setOpenWordId(null)}
        onOpen={setOpenWordId}
      />
    </>
  )
}
