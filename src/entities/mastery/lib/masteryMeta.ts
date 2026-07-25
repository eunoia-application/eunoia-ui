import type { MasteryStatus } from '@shared/api'
import { brand } from '@shared/theme'

/** Цвет листа и подпись статуса — единый словарь для списков и карточки. */
export const MASTERY_META: Record<MasteryStatus, { label: string; color: string }> = {
  KNOWN: { label: 'Знаю', color: brand.primary },
  LEARNING: { label: 'Учить', color: '#C9A227' },
  UNKNOWN: { label: 'Не знаю', color: '#93A29A' },
}

/** Все статусы — для легенды и подсчёта прогресса. */
export const MASTERY_ORDER: MasteryStatus[] = ['KNOWN', 'LEARNING', 'UNKNOWN']

/** Действия-кнопки (2): отметить «Знаю» или «Учить». Повтор снимает в UNKNOWN. */
export const MASTERY_ACTIONS: Exclude<MasteryStatus, 'UNKNOWN'>[] = ['KNOWN', 'LEARNING']

/**
 * Статус слова с учётом локальных отметок: они свежее серверных,
 * поэтому перекрывают их сразу после клика (оптимистично).
 */
export function resolveStatus(
  wordId: string,
  serverStatus: MasteryStatus,
  byId: Record<string, MasteryStatus>,
): MasteryStatus {
  return byId[wordId] ?? serverStatus
}
