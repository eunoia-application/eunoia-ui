import { describe, expect, it } from 'vitest'

import { MASTERY_ACTIONS, MASTERY_META, MASTERY_ORDER, resolveStatus } from './masteryMeta'

describe('masteryMeta', () => {
  it('локальная отметка перекрывает серверную раскраску', () => {
    expect(resolveStatus('en:go', 'UNKNOWN', { 'en:go': 'KNOWN' })).toBe('KNOWN')
  })

  it('без локальной отметки берётся серверный статус', () => {
    expect(resolveStatus('en:go', 'LEARNING', {})).toBe('LEARNING')
  })

  it('у каждого статуса есть подпись и цвет', () => {
    for (const status of MASTERY_ORDER) {
      expect(MASTERY_META[status].label).toBeTruthy()
      expect(MASTERY_META[status].color).toMatch(/^#/)
    }
  })

  it('действия-кнопки — ровно «Знаю» и «Учить»', () => {
    expect(MASTERY_ACTIONS).toEqual(['KNOWN', 'LEARNING'])
  })
})
