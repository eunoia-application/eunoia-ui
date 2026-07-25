import { Button, Flex } from 'antd'
import { GraduationCap, Leaf } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useBandStore } from '@entities/band'
import { useMasteryStore } from '@entities/mastery'
import { useSessionStore } from '@entities/session'
import { displayName } from '@entities/user'
import { wordApi } from '@entities/word'
import type { WordLeaf } from '@shared/api'
import { PATHS } from '@shared/config'
import { PageHeader } from '@shared/ui'
import { GardenTree } from '@widgets/garden-tree'
import { WordModal } from '@widgets/word-modal'

/** Сад: живое дерево знаний во весь экран — оно же навигация по блокам и словам. */
export function HomePage() {
  const navigate = useNavigate()
  const user = useSessionStore((state) => state.user)

  const bands = useBandStore((state) => state.bands)
  const fetchBands = useBandStore((state) => state.fetchBands)
  const byId = useMasteryStore((state) => state.byId)
  const fetchMine = useMasteryStore((state) => state.fetchMine)

  const [wordId, setWordId] = useState<string | null>(null)

  useEffect(() => {
    void fetchBands()
    void fetchMine()
  }, [fetchBands, fetchMine])

  const loadBandWords = useCallback(
    (band: string, limit: number): Promise<WordLeaf[]> =>
      wordApi.list({ band, limit }).then((page) => page.words),
    [],
  )

  return (
    <>
      <PageHeader
        title={`Здравствуйте, ${displayName(user)}`}
        description="Ваш сад знаний: наведите на ветку или лист — дерево и есть навигация."
      />

      <Flex vertical style={{ height: 'calc(100vh - 190px)', minHeight: 480 }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <GardenTree
            bands={bands}
            byId={byId}
            loadBandWords={loadBandWords}
            onSelectBand={() => navigate(PATHS.words)}
            onSelectWord={setWordId}
          />
        </div>
        <Flex justify="center" gap={12} wrap style={{ paddingTop: 12 }}>
          <Button type="primary" icon={<Leaf size={16} />} onClick={() => navigate(PATHS.words)}>
            К словам
          </Button>
          <Button icon={<GraduationCap size={16} />} onClick={() => navigate(PATHS.study)}>
            Учить
          </Button>
        </Flex>
      </Flex>

      <WordModal wordId={wordId} onClose={() => setWordId(null)} onOpen={setWordId} />
    </>
  )
}
