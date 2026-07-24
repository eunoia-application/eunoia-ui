import { describe, expect, it } from 'vitest'

import { makeWordLeaf } from '@shared/test/factories'

import { groupByTopic, POS_LABEL, POS_SHORT } from './wordMeta'

describe('wordMeta', () => {
  it('полные и короткие метки частей речи', () => {
    expect(POS_LABEL.VERB).toBe('глагол')
    expect(POS_SHORT.VERB).toBe('глаг.')
  })

  it('группирует по первой теме', () => {
    const groups = groupByTopic([
      makeWordLeaf({ id: 'a', topics: [{ id: 't1', name: 'Еда' }] }),
      makeWordLeaf({ id: 'b', topics: [{ id: 't1', name: 'Еда' }] }),
    ])
    expect(groups).toHaveLength(1)
    expect(groups[0].name).toBe('Еда')
    expect(groups[0].words).toHaveLength(2)
  })

  it('слова-сироты уходят в «Разное» в конец', () => {
    const groups = groupByTopic([
      makeWordLeaf({ id: 'x', topics: [] }),
      makeWordLeaf({ id: 'y', topics: [{ id: 't1', name: 'Еда' }] }),
    ])
    expect(groups.map((g) => g.name)).toEqual(['Еда', 'Разное'])
  })

  it('topics undefined → «Разное»', () => {
    const groups = groupByTopic([makeWordLeaf({ id: 'x', topics: undefined })])
    expect(groups[0].name).toBe('Разное')
  })

  it('пустой список → нет групп', () => {
    expect(groupByTopic([])).toEqual([])
  })
})
