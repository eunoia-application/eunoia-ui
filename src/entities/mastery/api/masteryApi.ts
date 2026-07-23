import { httpClient } from '@shared/api'
import type { MasteryRequest, MasteryStatus, MasteryView } from '@shared/api'

/** Транспорт отметок владения словом. */
export const masteryApi = {
  async getMine(): Promise<MasteryView[]> {
    const { data } = await httpClient.get<MasteryView[]>('/learning/mastery')
    return data
  },

  async setStatus(lexemeId: string, status: MasteryStatus): Promise<MasteryView> {
    const body: MasteryRequest = { status }
    const { data } = await httpClient.put<MasteryView>(
      `/learning/mastery/${encodeURIComponent(lexemeId)}`,
      body,
    )
    return data
  },
}
