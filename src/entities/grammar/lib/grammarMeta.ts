import type { Cefr, GrammarView } from '@shared/api'

/** Порядок уровней — им сортируем ствол снизу вверх. */
export const CEFR_ORDER: Cefr[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export interface CefrGroup {
  cefr: Cefr | 'OTHER'
  rules: GrammarView[]
}

/** Группирует правила по уровню, сохраняя порядок CEFR; без уровня — в конец. */
export function groupByCefr(rules: GrammarView[]): CefrGroup[] {
  const buckets = new Map<Cefr | 'OTHER', GrammarView[]>()
  for (const rule of rules) {
    const key = rule.cefr ?? 'OTHER'
    const list = buckets.get(key) ?? []
    list.push(rule)
    buckets.set(key, list)
  }

  const groups: CefrGroup[] = []
  for (const cefr of CEFR_ORDER) {
    const list = buckets.get(cefr)
    if (list?.length) groups.push({ cefr, rules: list })
  }
  const other = buckets.get('OTHER')
  if (other?.length) groups.push({ cefr: 'OTHER', rules: other })
  return groups
}
