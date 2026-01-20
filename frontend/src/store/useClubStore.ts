import { create } from 'zustand'
import { Club } from '@/types'
import { get } from '../lib/api'

interface ClubState {
  club: Club | null
  loading: boolean
  error: string | null
  fetchClub: (clubId: string) => Promise<void>
  setClub: (club: Club) => void
  clearError: () => void
}

export const useClubStore = create<ClubState>((set) => ({
  club: null,
  loading: false,
  error: null,

  fetchClub: async (clubId: string) => {
    set({ loading: true, error: null })
    try {
      const club = await get<Club>(`/clubs/${clubId}`)
      set({ club, loading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch club'
      set({ error: message, loading: false })
    }
  },

  setClub: (club) => set({ club }),

  clearError: () => set({ error: null }),
}))
