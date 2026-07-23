import { httpClient } from '@shared/api'
import type { TopicRef, TopicView } from '@shared/api'

/** Транспорт тем: корневые ветки сада и ветка со словами. */
export const topicApi = {
  async getRoots(): Promise<TopicRef[]> {
    const { data } = await httpClient.get<TopicRef[]>('/learning/topics')
    return data
  },

  async getView(id: string): Promise<TopicView> {
    const { data } = await httpClient.get<TopicView>(
      `/learning/topics/${encodeURIComponent(id)}`,
    )
    return data
  },
}
