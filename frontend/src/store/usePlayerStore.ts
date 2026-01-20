import { create } from 'zustand'
import { Player } from '@/types'
import { get } from '../lib/api'

interface PlayerState {
  players: Player[]
  loading: boolean
  error: string | null
  selectedPlayer: Player | null
  fetchPlayers: (clubId: string) => Promise<void>
  setSelectedPlayer: (player: Player | null) => void
  clearError: () => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  players: [],
  loading: false,
  error: null,
  selectedPlayer: null,

  fetchPlayers: async (clubId: string) => {
    set({ loading: true, error: null })
    try {
      const players = await get<Player[]>(`/players/club/${clubId}`)
      set({ players, loading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch players'
      set({ error: message, loading: false })
    }
  },

  setSelectedPlayer: (player) => set({ selectedPlayer: player }),

  clearError: () => set({ error: null }),
}))
