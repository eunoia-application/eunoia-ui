import { httpClient } from '@shared/api'
import type { LexemeCard, LexemeRef } from '@shared/api'

/**
 * Транспорт слов. Id лексемы вида `en:go:VERB` содержит двоеточия,
 * поэтому в пути его обязательно кодируем.
 */
export const lexemeApi = {
  async getCard(id: string): Promise<LexemeCard> {
    const { data } = await httpClient.get<LexemeCard>(
      `/learning/lexemes/${encodeURIComponent(id)}`,
    )
    return data
  },

  async search(q: string, limit?: number): Promise<LexemeRef[]> {
    const { data } = await httpClient.get<LexemeRef[]>('/learning/search', {
      params: { q, limit },
    })
    return data
  },
}
