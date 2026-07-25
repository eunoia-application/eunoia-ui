import { httpClient } from '@shared/api'
import type { GrammarView } from '@shared/api'

/** Транспорт грамматики: весь ствол и правило с деталями. */
export const grammarApi = {
  async listAll(): Promise<GrammarView[]> {
    const { data } = await httpClient.get<GrammarView[]>('/learning/grammar')
    return data
  },

  async getRule(id: string): Promise<GrammarView> {
    const { data } = await httpClient.get<GrammarView>(
      `/learning/grammar/${encodeURIComponent(id)}`,
    )
    return data
  },
}
