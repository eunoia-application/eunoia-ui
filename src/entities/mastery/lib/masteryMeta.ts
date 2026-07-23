import type { MasteryStatus } from '@shared/api'
import { brand } from '@shared/theme'

/** Цвет листа и подпись статуса — единый словарь для сада и карточки слова. */
export const MASTERY_META: Record<MasteryStatus, { label: string; color: string }> = {
  KNOWN: { label: 'Знаю', color: brand.primary },
  LEARNING: { label: 'Учу', color: '#C9A227' },
  UNKNOWN: { label: 'Не знаю', color: '#93A29A' },
}

/** Порядок для переключателей: от освоенного к неизвестному. */
export const MASTERY_ORDER: MasteryStatus[] = ['KNOWN', 'LEARNING', 'UNKNOWN']

/**
 * Статус листа с учётом локальных отметок: они свежее серверной раскраски,
 * поэтому перекрывают её сразу после клика (оптимистично).
 */
export function resolveStatus(
  lexemeId: string,
  serverStatus: MasteryStatus,
  byId: Record<string, MasteryStatus>,
): MasteryStatus {
  return byId[lexemeId] ?? serverStatus
}
