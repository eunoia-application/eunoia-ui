import { create } from 'zustand'

import { isApiError } from '@shared/api'
import type { ApiError, Band, RequestStatus } from '@shared/api'

import { bandApi } from '../api/bandApi'

interface BandState {
  bands: Band[]
  status: RequestStatus
  error: ApiError | null
  fetchBands: () => Promise<void>
  reset: () => void
}

export const useBandStore = create<BandState>((set) => ({
  bands: [],
  status: 'idle',
  error: null,

  fetchBands: async () => {
    set({ status: 'loading', error: null })
    try {
      const bands = await bandApi.getBands()
      set({ bands, status: 'success' })
    } catch (error) {
      set({ status: 'error', error: isApiError(error) ? error : null })
    }
  },

  reset: () => set({ bands: [], status: 'idle', error: null }),
}))
