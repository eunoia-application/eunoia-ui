import { Card } from 'antd'
import { GraduationCap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { MASTERY_META, resolveStatus, useMasteryStore } from '@entities/mastery'
import { leafMeta } from '@entities/word'
import { PATHS } from '@shared/config'
import { brand } from '@shared/theme'
import { CardSkeleton, EmptyState, ErrorRetry, PageHeader, WordCard } from '@shared/ui'
import { WordModal } from '@widgets/word-modal'

/** Учить: очередь слов на повторение (мои «Учить») → карточка → отметка. */
export function StudyPage() {
  const navigate = useNavigate()
  const study = useMasteryStore((state) => state.study)
  const status = useMasteryStore((state) => state.studyStatus)
  const error = useMasteryStore((state) => state.studyError)
  const fetchStudy = useMasteryStore((state) => state.fetchStudy)
  const fetchMine = useMasteryStore((state) => state.fetchMine)
  const byId = useMasteryStore((state) => state.byId)

  const [openWordId, setOpenWordId] = useState<string | null>(null)

  useEffect(() => {
    void fetchStudy()
    void fetchMine()
  }, [fetchStudy, fetchMine])

  const renderBody = () => {
    if (status === 'loading' && !study.length) return <CardSkeleton rows={3} />
    if (status === 'error' && !study.length) {
      return (
        <ErrorRetry
          error={error}
          onRetry={() => void fetchStudy()}
          title="Не удалось загрузить очередь"
        />
      )
    }
    if (!study.length) {
      return (
        <Card variant="borderless">
          <EmptyState
            icon={<GraduationCap size={44} color={brand.primary} strokeWidth={1.5} />}
            title="Очередь пуста"
            description="Отметьте слова «Учить» в разделе «Слова» — и они появятся здесь для повторения."
            action={{ label: 'Перейти к словам', onClick: () => navigate(PATHS.words) }}
          />
        </Card>
      )
    }
    return (
      <Card variant="borderless">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 10,
          }}
        >
          {study.map((leaf) => (
            <WordCard
              key={leaf.id}
              leaf={leaf}
              color={MASTERY_META[resolveStatus(leaf.id, leaf.status, byId)].color}
              meta={leafMeta(leaf)}
              onOpen={setOpenWordId}
            />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <>
      <PageHeader
        title="Учить"
        description="Слова, отмеченные «Учить» — повторяйте и отмечайте «Знаю»."
      />
      {renderBody()}
      <WordModal
        wordId={openWordId}
        onClose={() => setOpenWordId(null)}
        onOpen={setOpenWordId}
      />
    </>
  )
}
