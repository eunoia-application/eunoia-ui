import { Button, Card, Flex } from 'antd'
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
import { ProgressHero } from '@widgets/progress-hero'
import { WordModal } from '@widgets/word-modal'

/** Сад: живое дерево знаний, оно же навигация — ветки ведут в блоки, листья в слова. */
export function HomePage() {
  const navigate = useNavigate()
  const user = useSessionStore((state) => state.user)

  const bands = useBandStore((state) => state.bands)
  const bandsStatus = useBandStore((state) => state.status)
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

      <Flex vertical gap={20}>
        <Card variant="borderless" styles={{ body: { padding: '20px 24px 8px' } }}>
          <GardenTree
            bands={bands}
            byId={byId}
            loadBandWords={loadBandWords}
            onSelectBand={() => navigate(PATHS.words)}
            onSelectWord={setWordId}
          />
          <Flex justify="center" gap={12} wrap style={{ marginTop: 8 }}>
            <Button type="primary" icon={<Leaf size={16} />} onClick={() => navigate(PATHS.words)}>
              К словам
            </Button>
            <Button icon={<GraduationCap size={16} />} onClick={() => navigate(PATHS.study)}>
              Учить
            </Button>
          </Flex>
        </Card>

        <ProgressHero bands={bands} status={bandsStatus} />
      </Flex>

      <WordModal wordId={wordId} onClose={() => setWordId(null)} onOpen={setWordId} />
    </>
  )
}
