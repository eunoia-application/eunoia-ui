import { useEffect, useState } from 'react'

import { useGrammarStore } from '@entities/grammar'
import { PageHeader } from '@shared/ui'
import { GrammarList } from '@widgets/grammar'
import { GrammarModal } from '@widgets/grammar-modal'
import { WordModal } from '@widgets/word-modal'

/** Грамматика — ствол сада: правила по CEFR, детали и слова-примеры. */
export function GrammarPage() {
  const rules = useGrammarStore((state) => state.rules)
  const listStatus = useGrammarStore((state) => state.listStatus)
  const listError = useGrammarStore((state) => state.listError)
  const fetchAll = useGrammarStore((state) => state.fetchAll)

  const [openRuleId, setOpenRuleId] = useState<string | null>(null)
  const [openWordId, setOpenWordId] = useState<string | null>(null)

  useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  return (
    <>
      <PageHeader
        title="Грамматика"
        description="Ствол сада: конструкции по уровням, от простого к сложному."
      />

      <GrammarList
        rules={rules}
        status={listStatus}
        error={listError}
        activeId={openRuleId}
        onOpen={setOpenRuleId}
        onRetry={() => void fetchAll()}
      />

      <GrammarModal
        ruleId={openRuleId}
        onClose={() => setOpenRuleId(null)}
        onOpenRule={setOpenRuleId}
        onOpenWord={setOpenWordId}
      />

      <WordModal
        wordId={openWordId}
        onClose={() => setOpenWordId(null)}
        onOpen={setOpenWordId}
      />
    </>
  )
}
