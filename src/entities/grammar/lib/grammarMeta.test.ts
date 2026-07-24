import { describe, expect, it } from 'vitest'

import { makeGrammarView } from '@shared/test/factories'

import { CEFR_ORDER, groupByCefr } from './grammarMeta'

describe('grammarMeta', () => {
  it('CEFR_ORDER от A1 к C2', () => {
    expect(CEFR_ORDER[0]).toBe('A1')
    expect(CEFR_ORDER.at(-1)).toBe('C2')
  })

  it('группирует по уровню в порядке CEFR', () => {
    const groups = groupByCefr([
      makeGrammarView({ id: 'b1', cefr: 'B1' }),
      makeGrammarView({ id: 'a1', cefr: 'A1' }),
      makeGrammarView({ id: 'a1-2', cefr: 'A1' }),
    ])
    expect(groups.map((g) => g.cefr)).toEqual(['A1', 'B1'])
    expect(groups[0].rules).toHaveLength(2)
  })

  it('правила без уровня уходят в OTHER в конец', () => {
    const groups = groupByCefr([
      makeGrammarView({ id: 'x', cefr: undefined }),
      makeGrammarView({ id: 'a1', cefr: 'A1' }),
    ])
    expect(groups.map((g) => g.cefr)).toEqual(['A1', 'OTHER'])
  })

  it('пустой список → нет групп', () => {
    expect(groupByCefr([])).toEqual([])
  })
})
