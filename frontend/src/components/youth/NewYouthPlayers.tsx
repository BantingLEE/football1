'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Player } from '@/types'
import { Sparkles, Calendar, TrendingUp, Star } from 'lucide-react'

interface NewYouthPlayersProps {
  players: Array<{ player: Player; scoutingReport: string }>
  loading?: boolean
}

export function NewYouthPlayers({
  players,
  loading,
}: NewYouthPlayersProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `€${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `€${(amount / 1000).toFixed(0)}K`
    }
    return `€${amount}`
  }

  const getRatingStars = (potential: number) => {
    const stars = Math.min(Math.floor((potential - 50) / 10), 5)
    return Array.from({ length: stars }).map((_, i) => (
      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
    ))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            New Youth Players
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-gray-200 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (players.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            New Youth Players
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No new players this week</p>
            <p className="text-sm mt-2">
              New youth players will appear after each season
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          New Youth Players
          <Badge variant="secondary">{players.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {players.map(({ player, scoutingReport }) => (
            <div
              key={player._id}
              className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-lg">{player.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{player.position}</Badge>
                    <Badge variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      {player.age} years old
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getRatingStars(player.potential)}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                <div>
                  <div className="text-gray-600 text-xs">Current Ability</div>
                  <div className="font-semibold">{player.currentAbility}</div>
                </div>
                <div>
                  <div className="text-gray-600 text-xs">Potential</div>
                  <div className="font-semibold text-blue-600">
                    {player.potential}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 text-xs">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    Growth
                  </div>
                  <div className="font-semibold text-green-600">
                    +{player.potential - player.currentAbility}
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded border text-sm">
                <div className="font-medium text-gray-700 mb-1">
                  Scouting Report
                </div>
                <p className="text-gray-600 text-xs">{scoutingReport}</p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-gray-100 rounded">
                  Speed: {player.attributes.speed}
                </span>
                <span className="px-2 py-1 bg-gray-100 rounded">
                  Technical: {player.attributes.technical}
                </span>
                <span className="px-2 py-1 bg-gray-100 rounded">
                  Mental: {player.attributes.mental}
                </span>
                <span className="px-2 py-1 bg-gray-100 rounded">
                  Physical: {player.attributes.physical}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
