'use client'

import { useState, useEffect } from 'react'
import { Player } from '@/types'
import { get, post } from '@/lib/api'
import { YouthFacilityPanel } from '@/components/youth/YouthFacilityPanel'
import { YouthPlayerList } from '@/components/youth/YouthPlayerList'
import { TrainingPanel } from '@/components/youth/TrainingPanel'
import { YouthPromoteDialog } from '@/components/youth/YouthPromoteDialog'
import { NewYouthPlayers } from '@/components/youth/NewYouthPlayers'
import { Building2, Trophy, Dumbbell, Sparkles } from 'lucide-react'

type TrainingType = 'physical' | 'technical' | 'tactical' | 'mental'

interface TrainingConfig {
  type: TrainingType
  duration: number
}

export default function YouthPage() {
  const [youthPlayers, setYouthPlayers] = useState<
    Array<{ player: Player; trainingProgress: number }>
  >([])
  const [newYouthPlayers, setNewYouthPlayers] = useState<
    Array<{ player: Player; scoutingReport: string }>
  >([])
  const [facility, setFacility] = useState({
    level: 1,
    capacity: 20,
    trainingQuality: 50,
    upgradeCost: 500000,
    currentPlayers: 0,
  })
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>({
    type: 'physical',
    duration: 2,
  })
  const [loading, setLoading] = useState(true)
  const [newPlayersLoading, setNewPlayersLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [training, setTraining] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false)
  const [salaryOffer, setSalaryOffer] = useState(5000)

  const fetchYouthPlayers = async () => {
    setLoading(true)
    try {
      const response = await get('/youth/players')
      const players = response as Array<{
        player: Player
        trainingProgress: number
      }>
      setYouthPlayers(players)
      setFacility((prev) => ({ ...prev, currentPlayers: players.length }))
    } catch (error) {
      console.error('Failed to fetch youth players:', error)
      setYouthPlayers([])
    } finally {
      setLoading(false)
    }
  }

  const fetchNewYouthPlayers = async () => {
    setNewPlayersLoading(true)
    try {
      const response = await get('/youth/new')
      setNewYouthPlayers(response as Array<{
        player: Player
        scoutingReport: string
      }>)
    } catch (error) {
      console.error('Failed to fetch new youth players:', error)
      setNewYouthPlayers([])
    } finally {
      setNewPlayersLoading(false)
    }
  }

  const fetchFacility = async () => {
    try {
      const response = await get('/youth/facility')
      setFacility(response as typeof facility)
    } catch (error) {
      console.error('Failed to fetch facility:', error)
    }
  }

  useEffect(() => {
    fetchYouthPlayers()
    fetchNewYouthPlayers()
    fetchFacility()
  }, [])

  const handleUpgradeFacility = async () => {
    setUpgrading(true)
    try {
      await post('/youth/upgrade')
      await fetchFacility()
    } catch (error) {
      console.error('Failed to upgrade facility:', error)
    } finally {
      setUpgrading(false)
    }
  }

  const handleUpdateTraining = (config: TrainingConfig) => {
    setTrainingConfig(config)
  }

  const handleStartTraining = async () => {
    setTraining(true)
    try {
      await post('/youth/train', {
        type: trainingConfig.type,
        duration: trainingConfig.duration,
      })
      await fetchYouthPlayers()
    } catch (error) {
      console.error('Failed to start training:', error)
    } finally {
      setTraining(false)
    }
  }

  const handlePromote = (player: Player) => {
    setSelectedPlayer(player)
    setSalaryOffer(Math.round(player.currentAbility * 100))
    setPromoteDialogOpen(true)
  }

  const handleTrainPlayer = async (playerId: string) => {
    try {
      await post(`/youth/train-player/${playerId}`)
      await fetchYouthPlayers()
    } catch (error) {
      console.error('Failed to train player:', error)
    }
  }

  const handlePromoteSuccess = () => {
    fetchYouthPlayers()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Youth Academy
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your youth development system and nurture future stars
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <YouthFacilityPanel
              facility={facility}
              onUpgrade={handleUpgradeFacility}
              loading={upgrading}
            />

            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Youth Players
                <span className="text-sm font-normal text-gray-500">
                  ({youthPlayers.length} players)
                </span>
              </h2>
              <YouthPlayerList
                players={youthPlayers}
                onPromote={handlePromote}
                onTrain={handleTrainPlayer}
                loading={loading}
              />
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <TrainingPanel
              trainingConfig={trainingConfig}
              onUpdateConfig={handleUpdateTraining}
              onStartTraining={handleStartTraining}
              loading={training}
            />

            <NewYouthPlayers
              players={newYouthPlayers}
              loading={newPlayersLoading}
            />
          </div>
        </div>
      </div>

      <YouthPromoteDialog
        open={promoteDialogOpen}
        onOpenChange={setPromoteDialogOpen}
        player={selectedPlayer}
        salaryOffer={salaryOffer}
        onSuccess={handlePromoteSuccess}
      />
    </div>
  )
}
