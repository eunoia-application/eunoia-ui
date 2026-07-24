import type { PartOfSpeech, WordLeaf } from '@shared/api'

/** Человекочитаемые части речи (в контракте — enum на латинице). */
export const POS_LABEL: Record<PartOfSpeech, string> = {
  NOUN: 'существительное',
  VERB: 'глагол',
  ADJECTIVE: 'прилагательное',
  ADVERB: 'наречие',
  PRONOUN: 'местоимение',
  PREPOSITION: 'предлог',
  CONJUNCTION: 'союз',
  DETERMINER: 'артикль',
  INTERJECTION: 'междометие',
  NUMERAL: 'числительное',
  OTHER: 'другое',
}

/** Короткие метки для чипов и тегов (go · глаг.). */
export const POS_SHORT: Record<PartOfSpeech, string> = {
  NOUN: 'сущ.',
  VERB: 'глаг.',
  ADJECTIVE: 'прил.',
  ADVERB: 'нареч.',
  PRONOUN: 'мест.',
  PREPOSITION: 'предл.',
  CONJUNCTION: 'союз',
  DETERMINER: 'арт.',
  INTERJECTION: 'межд.',
  NUMERAL: 'числ.',
  OTHER: '—',
}

const MISC_TOPIC = 'Разное'

export interface TopicGroup {
  name: string
  words: WordLeaf[]
}

/**
 * Группирует слова по первой теме; без темы — в «Разное» (в конец).
 * Так внутри блока частотности слова читаются по смыслу, а сироты не мусорят.
 */
export function groupByTopic(words: WordLeaf[]): TopicGroup[] {
  const map = new Map<string, WordLeaf[]>()
  const order: string[] = []
  for (const word of words) {
    const name = word.topics?.[0]?.name ?? MISC_TOPIC
    if (!map.has(name)) {
      map.set(name, [])
      order.push(name)
    }
    map.get(name)?.push(word)
  }
  const names = [
    ...order.filter((n) => n !== MISC_TOPIC),
    ...(map.has(MISC_TOPIC) ? [MISC_TOPIC] : []),
  ]
  return names.map((name) => ({ name, words: map.get(name) ?? [] }))
}
