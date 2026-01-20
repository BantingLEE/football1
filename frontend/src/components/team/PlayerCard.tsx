'use client'

import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Player } from '@/types'

interface PlayerCardProps {
  player: Player
  onClick?: () => void
}

export default function PlayerCard({ player, onClick }: PlayerCardProps) {
  const positionColors = {
    GK: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
    DEF: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
    MID: 'bg-green-500/20 text-green-500 border-green-500/50',
    FWD: 'bg-red-500/20 text-red-500 border-red-500/50',
  }

  const getOverallColor = (overall: number) => {
    if (overall >= 90) return 'text-yellow-400'
    if (overall >= 85) return 'text-orange-400'
    if (overall >= 80) return 'text-lime-400'
    if (overall >= 75) return 'text-green-400'
    if (overall >= 70) return 'text-emerald-400'
    return 'text-gray-400'
  }

  const potentialDiff = player.potential - player.overall
  const isImproving = potentialDiff > 5
  const isDeclining = player.age > 32

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative bg-card border border-border rounded-lg p-4 cursor-pointer',
        'hover:border-primary transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        player.injured && 'border-destructive/50 bg-destructive/5'
      )}
    >
      {(player.injured || player.suspended) && (
        <div className="absolute top-2 right-2">
          <AlertTriangle className={cn(
            'h-5 w-5',
            player.injured ? 'text-destructive' : 'text-yellow-500'
          )} />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight">{player.name}</h3>
            <p className="text-sm text-muted-foreground">{player.nationality} • {player.age} yrs</p>
          </div>
          <div className="text-right">
            <span className={cn('text-2xl font-bold', getOverallColor(player.overall))}>
              {player.overall}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn(
            'px-2 py-1 text-xs font-bold rounded border',
            positionColors[player.position]
          )}>
            {player.position}
          </span>
          {isImproving && (
            <TrendingUp className="h-4 w-4 text-green-500" />
          )}
          {isDeclining && (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <p className="font-semibold">{player.rating.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
          <div>
            <p className="font-semibold">{player.form}%</p>
            <p className="text-xs text-muted-foreground">Form</p>
          </div>
          <div>
            <p className={cn('font-semibold', player.stamina < 50 && 'text-yellow-500')}>
              {player.stamina}%
            </p>
            <p className="text-xs text-muted-foreground">Stamina</p>
          </div>
        </div>

        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{player.goals} G</span>
          <span>{player.assists} A</span>
          <span>{player.yellowCards} YC</span>
          <span>{player.redCards} RC</span>
        </div>

        <div className="pt-2 border-t border-border flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Value</span>
          <span className="font-semibold">
            €{(player.value / 1000000).toFixed(1)}M
          </span>
        </div>

        {player.injured && (
          <div className="text-xs text-destructive font-medium">
            INJURED
          </div>
        )}
        {player.suspended && !player.injured && (
          <div className="text-xs text-yellow-500 font-medium">
            SUSPENDED
          </div>
        )}
      </div>
    </div>
  )
}
