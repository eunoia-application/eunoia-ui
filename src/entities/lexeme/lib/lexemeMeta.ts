import type { PartOfSpeech } from '@shared/api'

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
