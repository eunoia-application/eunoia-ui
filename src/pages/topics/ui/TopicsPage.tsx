import { Button, Card, Flex } from 'antd'
import { Tags } from 'lucide-react'
import { useEffect, useState } from 'react'

import { MASTERY_META, resolveStatus, useMasteryStore } from '@entities/mastery'
import { useTopicStore } from '@entities/topic'
import { leafMeta } from '@entities/word'
import { brand } from '@shared/theme'
import {
  CardSkeleton,
  EmptyState,
  ErrorRetry,
  ListSkeleton,
  PageHeader,
  WordCard,
} from '@shared/ui'
import { WordModal } from '@widgets/word-modal'

/** Темы: категории слов → тема со словами карточками → карточка слова. */
export function TopicsPage() {
  const roots = useTopicStore((state) => state.roots)
  const rootsStatus = useTopicStore((state) => state.rootsStatus)
  const rootsError = useTopicStore((state) => state.rootsError)
  const fetchRoots = useTopicStore((state) => state.fetchRoots)
  const view = useTopicStore((state) => state.view)
  const viewStatus = useTopicStore((state) => state.viewStatus)
  const viewError = useTopicStore((state) => state.viewError)
  const fetchView = useTopicStore((state) => state.fetchView)

  const byId = useMasteryStore((state) => state.byId)
  const fetchMine = useMasteryStore((state) => state.fetchMine)

  const [activeTopicId, setActiveTopicId] = useState<string | null>(null)
  const [openWordId, setOpenWordId] = useState<string | null>(null)

  useEffect(() => {
    void fetchRoots()
    void fetchMine()
  }, [fetchRoots, fetchMine])

  useEffect(() => {
    if (!activeTopicId && roots.length) setActiveTopicId(roots[0].id)
  }, [roots, activeTopicId])

  useEffect(() => {
    if (activeTopicId) void fetchView(activeTopicId)
  }, [activeTopicId, fetchView])

  const renderChips = () => {
    if (rootsStatus === 'loading' && !roots.length) return <ListSkeleton count={1} rows={1} />
    if (rootsStatus === 'error' && !roots.length) {
      return <ErrorRetry error={rootsError} onRetry={() => void fetchRoots()} title="Не удалось загрузить темы" />
    }
    if (!roots.length) {
      return (
        <Card variant="borderless">
          <EmptyState
            icon={<Tags size={40} color={brand.primary} strokeWidth={1.5} />}
            title="Тем пока нет"
          />
        </Card>
      )
    }
    return (
      <Flex wrap gap={10}>
        {roots.map((topic) => (
          <Button
            key={topic.id}
            type={topic.id === activeTopicId ? 'primary' : 'default'}
            shape="round"
            icon={<Tags size={15} />}
            onClick={() => setActiveTopicId(topic.id)}
          >
            {topic.name}
          </Button>
        ))}
      </Flex>
    )
  }

  const renderWords = () => {
    if (!activeTopicId) return null
    if (viewStatus === 'loading' && !view) return <CardSkeleton rows={4} />
    if (viewStatus === 'error' && !view) {
      return <ErrorRetry error={viewError} onRetry={() => void fetchView(activeTopicId)} title="Не удалось раскрыть тему" />
    }
    if (!view) return null

    const words = view.words ?? []
    return (
      <Card title={view.topic.name} variant="borderless">
        {words.length === 0 ? (
          <EmptyState
            icon={<Tags size={40} color={MASTERY_META.UNKNOWN.color} strokeWidth={1.5} />}
            title="В теме пока нет слов"
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: 10,
            }}
          >
            {words.map((leaf) => (
              <WordCard
                key={leaf.id}
                leaf={leaf}
                color={MASTERY_META[resolveStatus(leaf.id, leaf.status, byId)].color}
                meta={leafMeta(leaf)}
                onOpen={setOpenWordId}
              />
            ))}
          </div>
        )}
      </Card>
    )
  }

  return (
    <>
      <PageHeader
        title="Темы"
        description="Слова по категориям — выбирайте тему и отмечайте владение."
      />
      <Flex vertical gap={20}>
        {renderChips()}
        {renderWords()}
      </Flex>
      <WordModal
        wordId={openWordId}
        onClose={() => setOpenWordId(null)}
        onOpen={setOpenWordId}
      />
    </>
  )
}
