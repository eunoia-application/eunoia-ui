/** Размерности сада: сколько ветвей-блоков и листьев-слов несёт дерево. */

/** Зерно детерминированной «случайности» — дерево у всех растёт одинаково красиво. */
export const TREE_SEED = 7

/** Ветвей-блоков максимум (первые N блоков слов). */
export const MAX_BRANCHES = 5

/**
 * Листьев-слов на ветку: слот = конкретное слово блока (по частоте).
 * Это же — limit ленивой подгрузки слов блока.
 */
export const CLUSTER_CAPACITY = [64, 56, 56, 48, 48] as const

/** Смещение грозди в общем буфере инстансов: слот = offset[cluster] + local. */
export const CLUSTER_OFFSETS = CLUSTER_CAPACITY.reduce<number[]>(
  (acc, _, i) => [...acc, i === 0 ? 0 : acc[i - 1] + CLUSTER_CAPACITY[i - 1]],
  [],
)

/** Всего интерактивных слотов-слов. */
export const SLOT_TOTAL = CLUSTER_CAPACITY.reduce<number>((a, b) => a + b, 0)

/** Плодов на полностью освоенной ветке. */
export const FRUITS_PER_BRANCH = 3
