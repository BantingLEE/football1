'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Player } from '@/types'
import { Euro, Calendar, TrendingUp } from 'lucide-react'

interface PlayerCardProps {
  player: Player
  value: number
  onMakeOffer: (player: Player) => void
}

function PlayerCard({ player, value, onMakeOffer }: PlayerCardProps) {
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

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `€${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `€${(amount / 1000).toFixed(0)}K`
    }
    return `€${amount}`
  }

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
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(value)}
            </div>
            <div className="text-xs text-gray-500">Market Value</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
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
            <span className="text-gray-600">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Growth
            </span>
            <span className="font-semibold">
              {player.potential - player.currentAbility}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-4">
          <div>
            <div className="font-medium">Speed</div>
            <div className="text-sm font-semibold">{player.attributes.speed}</div>
          </div>
          <div>
            <div className="font-medium">Shooting</div>
            <div className="text-sm font-semibold">{player.attributes.shooting}</div>
          </div>
          <div>
            <div className="font-medium">Passing</div>
            <div className="text-sm font-semibold">{player.attributes.passing}</div>
          </div>
          <div>
            <div className="font-medium">Defending</div>
            <div className="text-sm font-semibold">{player.attributes.defending}</div>
          </div>
          <div>
            <div className="font-medium">Physical</div>
            <div className="text-sm font-semibold">{player.attributes.physical}</div>
          </div>
          <div>
            <div className="font-medium">Technical</div>
            <div className="text-sm font-semibold">{player.attributes.technical}</div>
          </div>
        </div>

        <Button
          onClick={() => onMakeOffer(player)}
          className="w-full"
          variant="default"
        >
          <Euro className="h-4 w-4 mr-2" />
          Make Offer
        </Button>
      </CardContent>
    </Card>
  )
}

interface TransferListProps {
  players: Array<{ player: Player; value: number }>
  onMakeOffer: (player: Player) => void
  loading?: boolean
}

export function TransferList({ players, onMakeOffer, loading }: TransferListProps) {
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
        <div className="text-gray-400 text-6xl mb-4">⚽</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No players found
        </h3>
        <p className="text-gray-500">Try adjusting your search criteria</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {players.map(({ player, value }) => (
        <PlayerCard
          key={player._id}
          player={player}
          value={value}
          onMakeOffer={onMakeOffer}
        />
      ))}
    </div>
  )
}
