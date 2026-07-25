import { httpClient } from '@shared/api'
import type { Band } from '@shared/api'

/** Транспорт блоков топ-слов (уровни по частотности + прогресс). */
export const bandApi = {
  async getBands(): Promise<Band[]> {
    const { data } = await httpClient.get<Band[]>('/learning/bands')
    return data
  },
}
