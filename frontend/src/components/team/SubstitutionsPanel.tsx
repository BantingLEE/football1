'use client'

import { useState } from 'react'
import { ArrowRightLeft, UserMinus, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Player } from '@/types'

interface SubstitutionsPanelProps {
  startingXI: Player[]
  bench: Player[]
  onSubstitute?: (playerOut: Player, playerIn: Player) => void
}

export default function SubstitutionsPanel({ startingXI, bench, onSubstitute }: SubstitutionsPanelProps) {
  const [selectedOut, setSelectedOut] = useState<Player | null>(null)
  const [selectedIn, setSelectedIn] = useState<Player | null>(null)

  const handleSubstitute = () => {
    if (selectedOut && selectedIn) {
      onSubstitute?.(selectedOut, selectedIn)
      setSelectedOut(null)
      setSelectedIn(null)
    }
  }

  const PlayerRow = ({
    player,
    isSelected,
    onClick,
    side
  }: {
    player: Player
    isSelected: boolean
    onClick: () => void
    side: 'out' | 'in'
  }) => {
    const positionColors = {
      GK: 'bg-yellow-500/20 text-yellow-500',
      DEF: 'bg-blue-500/20 text-blue-500',
      MID: 'bg-green-500/20 text-green-500',
      FWD: 'bg-red-500/20 text-red-500',
    }

    return (
      <button
        onClick={onClick}
        disabled={player.injured || player.suspended}
        className={cn(
          'w-full p-3 rounded-lg border text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          isSelected
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary hover:bg-accent'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={cn(
              'w-8 h-8 flex items-center justify-center rounded text-xs font-bold',
              positionColors[player.position]
            )}>
              {player.position}
            </span>
            <div>
              <p className="font-medium text-sm">{player.name}</p>
              <p className="text-xs text-muted-foreground">
                {player.overall} • {player.stamina}% stamina
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {side === 'out' && isSelected && <UserMinus className="h-4 w-4 text-destructive" />}
            {side === 'in' && isSelected && <UserPlus className="h-4 w-4 text-green-500" />}
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Substitutions</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserMinus className="h-5 w-5 text-destructive" />
            <h3 className="font-semibold">Player Out</h3>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {startingXI.map(player => (
              <PlayerRow
                key={player.id}
                player={player}
                isSelected={selectedOut?.id === player.id}
                onClick={() => setSelectedOut(player)}
                side="out"
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">Player In</h3>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {bench.map(player => (
              <PlayerRow
                key={player.id}
                player={player}
                isSelected={selectedIn?.id === player.id}
                onClick={() => setSelectedIn(player)}
                side="in"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 p-4 bg-card border border-border rounded-lg">
        <div className="flex-1 text-center">
          <p className="text-sm font-medium">Selected Out</p>
          <p className="text-lg font-bold">
            {selectedOut?.name || 'None'}
          </p>
        </div>

        <div className="flex flex-col items-center">
          <ArrowRightLeft className="h-8 w-8 text-primary mb-2" />
          <button
            onClick={handleSubstitute}
            disabled={!selectedOut || !selectedIn}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Make Substitution
          </button>
        </div>

        <div className="flex-1 text-center">
          <p className="text-sm font-medium">Selected In</p>
          <p className="text-lg font-bold">
            {selectedIn?.name || 'None'}
          </p>
        </div>
      </div>

      {startingXI.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No starting lineup selected
        </div>
      )}

      {bench.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No substitutes available
        </div>
      )}
    </div>
  )
}
