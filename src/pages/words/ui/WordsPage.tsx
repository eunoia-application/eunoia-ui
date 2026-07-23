import { Flex } from 'antd'
import { useEffect, useState } from 'react'

import { useMasteryStore } from '@entities/mastery'
import { useTopicStore } from '@entities/topic'
import { LexemeSearch } from '@features/search-lexemes'
import { PageHeader } from '@shared/ui'
import { GardenBranches, GardenLeaves, MasteryStats } from '@widgets/garden'
import { LexemeDrawer } from '@widgets/lexeme-drawer'

/** Слова: ветки — темы, листья — лексемы с моей раскраской по статусу. */
export function WordsPage() {
  const roots = useTopicStore((state) => state.roots)
  const rootsStatus = useTopicStore((state) => state.rootsStatus)
  const rootsError = useTopicStore((state) => state.rootsError)
  const fetchRoots = useTopicStore((state) => state.fetchRoots)
  const view = useTopicStore((state) => state.view)
  const viewStatus = useTopicStore((state) => state.viewStatus)
  const viewError = useTopicStore((state) => state.viewError)
  const fetchView = useTopicStore((state) => state.fetchView)

  const fetchMine = useMasteryStore((state) => state.fetchMine)

  const [activeTopicId, setActiveTopicId] = useState<string | null>(null)
  const [openLexemeId, setOpenLexemeId] = useState<string | null>(null)

  useEffect(() => {
    void fetchRoots()
    void fetchMine()
  }, [fetchRoots, fetchMine])

  // Первая ветка раскрывается сама — раздел не должен встречать пустотой.
  useEffect(() => {
    if (!activeTopicId && roots.length) setActiveTopicId(roots[0].id)
  }, [roots, activeTopicId])

  useEffect(() => {
    if (activeTopicId) void fetchView(activeTopicId)
  }, [activeTopicId, fetchView])

  return (
    <>
      <PageHeader
        title="Слова"
        description="Ветки — темы, листья — слова. Отмечайте, что уже знаете."
      />

      <Flex vertical gap={20}>
        <MasteryStats />

        <LexemeSearch onPick={setOpenLexemeId} />

        <GardenBranches
          roots={roots}
          status={rootsStatus}
          error={rootsError}
          activeId={activeTopicId}
          onSelect={setActiveTopicId}
          onRetry={() => void fetchRoots()}
        />

        <GardenLeaves
          view={view}
          status={viewStatus}
          error={viewError}
          onOpen={setOpenLexemeId}
          onRetry={() => {
            if (activeTopicId) void fetchView(activeTopicId)
          }}
        />
      </Flex>

      <LexemeDrawer
        lexemeId={openLexemeId}
        onClose={() => setOpenLexemeId(null)}
        onOpen={setOpenLexemeId}
      />
    </>
  )
}
