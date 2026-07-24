import { httpClient } from '@shared/api'
import type { WordCard, WordPage, WordRef } from '@shared/api'

/** Транспорт слов. Id — лемма вида `en:go`, в пути кодируем (есть двоеточие). */
export const wordApi = {
  async getCard(id: string): Promise<WordCard> {
    const { data } = await httpClient.get<WordCard>(
      `/learning/words/${encodeURIComponent(id)}`,
    )
    return data
  },

  async search(q: string, limit?: number): Promise<WordRef[]> {
    const { data } = await httpClient.get<WordRef[]>('/learning/search', {
      params: { q, limit },
    })
    return data
  },

  async list(params: {
    band?: string
    offset?: number
    limit?: number
  }): Promise<WordPage> {
    const { data } = await httpClient.get<WordPage>('/learning/words', { params })
    return data
  },
}
