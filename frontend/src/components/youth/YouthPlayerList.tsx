'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Player } from '@/types'
import { TrendingUp, Calendar, Trophy, Target } from 'lucide-react'

interface YouthPlayerListProps {
  players: Array<{ player: Player; trainingProgress: number }>
  onPromote: (player: Player) => void
  onTrain: (playerId: string) => void
  loading?: boolean
}

function YouthPlayerCard({
  player,
  trainingProgress,
  onPromote,
  onTrain,
}: {
  player: Player
  trainingProgress: number
  onPromote: () => void
  onTrain: () => void
}) {
  const positionColors: Record<string, string> = {
    GK: 'bg-yellow-500',
    CB: 'bg-blue-500',
    RB: 'bg-blue-400',
    LB: 'bg-blue-400',
    CDM: 'bg-green-600',
    CM: 'bg-green-500',
    CAM: 'bg-green-400',
    RM: 'bg-orange-400',
    LM: 'bg-orange-400',
    ST: 'bg-red-500',
    CF: 'bg-red-400',
    LW: 'bg-orange-500',
    RW: 'bg-orange-500',
  }

  const getPotentialRating = (player: Player) => {
    const growth = player.potential - player.currentAbility
    if (growth >= 20) return { text: 'Elite', color: 'bg-purple-500' }
    if (growth >= 15) return { text: 'High', color: 'bg-blue-500' }
    if (growth >= 10) return { text: 'Good', color: 'bg-green-500' }
    if (growth >= 5) return { text: 'Average', color: 'bg-yellow-500' }
    return { text: 'Low', color: 'bg-gray-500' }
  }

  const potential = getPotentialRating(player)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{player.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`${positionColors[player.position]} text-white`}>
                {player.position}
              </Badge>
              <Badge variant="outline">
                <Calendar className="h-3 w-3 mr-1" />
                {player.age}
              </Badge>
              <Badge className={`${potential.color} text-white`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {potential.text} Potential
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Current Ability</span>
            <span className="font-semibold">{player.currentAbility}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Potential</span>
            <span className="font-semibold text-blue-600">
              {player.potential}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Growth Potential</span>
            <span className="font-semibold text-green-600">
              +{player.potential - player.currentAbility}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Training Progress</span>
              <span>{trainingProgress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${trainingProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-4">
          <div>
            <div className="font-medium">Speed</div>
            <div className="text-sm font-semibold">{player.attributes.speed}</div>
          </div>
          <div>
            <div className="font-medium">Technical</div>
            <div className="text-sm font-semibold">
              {player.attributes.technical}
            </div>
          </div>
          <div>
            <div className="font-medium">Mental</div>
            <div className="text-sm font-semibold">{player.attributes.mental}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onTrain}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            <Target className="h-4 w-4 mr-1" />
            Train
          </Button>
          <Button
            onClick={onPromote}
            className="flex-1"
            size="sm"
            disabled={player.age < 16}
          >
            <Trophy className="h-4 w-4 mr-1" />
            Promote
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function YouthPlayerList({
  players,
  onPromote,
  onTrain,
  loading,
}: YouthPlayerListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (players.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🏫</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No youth players yet
        </h3>
        <p className="text-gray-500">
          New youth players will be generated at the end of each season
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {players.map(({ player, trainingProgress }) => (
        <YouthPlayerCard
          key={player._id}
          player={player}
          trainingProgress={trainingProgress}
          onPromote={() => onPromote(player)}
          onTrain={() => onTrain(player._id)}
        />
      ))}
    </div>
  )
}
