'use client'

import { useState, useEffect } from 'react'
import { Player } from '@/types'
import { get } from '@/lib/api'
import { PlayerSearch } from '@/components/transfers/PlayerSearch'
import { TransferList } from '@/components/transfers/TransferList'
import { TransferDialog } from '@/components/transfers/TransferDialog'
import { TransferHistory } from '@/components/transfers/TransferHistory'

type TransferFilters = {
  name: string
  position: string
  minAge: number
  maxAge: number
  minValue: number
  maxValue: number
}

export default function TransfersPage() {
  const [availablePlayers, setAvailablePlayers] = useState<
    Array<{ player: Player; value: number }>
  >([])
  const [transferHistory, setTransferHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [selectedPlayerValue, setSelectedPlayerValue] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchAvailablePlayers = async (filters: TransferFilters) => {
    setLoading(true)
    try {
      const response = await get('/transfers/available', { params: filters })
      setAvailablePlayers(response as Array<{ player: Player; value: number }>)
    } catch (error) {
      console.error('Failed to fetch available players:', error)
      setAvailablePlayers([])
    } finally {
      setLoading(false)
    }
  }

  const fetchTransferHistory = async () => {
    setHistoryLoading(true)
    try {
      const response = await get('/transfers/history')
      setTransferHistory(response as any[])
    } catch (error) {
      console.error('Failed to fetch transfer history:', error)
      setTransferHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailablePlayers({
      name: '',
      position: '',
      minAge: 0,
      maxAge: 100,
      minValue: 0,
      maxValue: 999999999,
    })
    fetchTransferHistory()
  }, [])

  const handleSearch = (filters: TransferFilters) => {
    fetchAvailablePlayers(filters)
  }

  const handleMakeOffer = (player: Player) => {
    const playerData = availablePlayers.find((p) => p.player._id === player._id)
    setSelectedPlayer(player)
    setSelectedPlayerValue(playerData?.value || 0)
    setDialogOpen(true)
  }

  const handleOfferSuccess = () => {
    fetchTransferHistory()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transfer Market</h1>
          <p className="text-gray-600 mt-2">
            Search for available players and make transfer offers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PlayerSearch onSearch={handleSearch} />
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Available Players
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({availablePlayers.length} players)
                </span>
              </h2>
              <TransferList
                players={availablePlayers}
                onMakeOffer={handleMakeOffer}
                loading={loading}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <TransferHistory transfers={transferHistory} loading={historyLoading} />
          </div>
        </div>
      </div>

      <TransferDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        player={selectedPlayer}
        playerValue={selectedPlayerValue}
        onSuccess={handleOfferSuccess}
      />
    </div>
  )
}
