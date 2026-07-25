import { httpClient } from '@shared/api'
import type {
  MasteryRequest,
  MasteryStatus,
  MasteryView,
  WordLeaf,
} from '@shared/api'

/** Транспорт отметок владения словом (id = лемма `en:go`). */
export const masteryApi = {
  async getMine(): Promise<MasteryView[]> {
    const { data } = await httpClient.get<MasteryView[]>('/learning/mastery')
    return data
  },

  async setStatus(wordId: string, status: MasteryStatus): Promise<MasteryView> {
    const body: MasteryRequest = { status }
    const { data } = await httpClient.put<MasteryView>(
      `/learning/mastery/${encodeURIComponent(wordId)}`,
      body,
    )
    return data
  },

  /** Очередь «Учить» — мои слова со статусом LEARNING. */
  async getStudy(): Promise<WordLeaf[]> {
    const { data } = await httpClient.get<WordLeaf[]>('/learning/study')
    return data
  },
}
