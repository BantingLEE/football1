'use client'

import { useState } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tactics, Player } from '@/types'

interface TacticsPanelProps {
  tactics: Tactics
  players: Player[]
  onSave?: (tactics: Tactics) => void
}

const formations = [
  '4-4-2', '4-3-3', '3-5-2', '4-5-1', '5-3-2', '4-2-3-1', '3-4-3', '5-4-1'
]

export default function TacticsPanel({ tactics, players, onSave }: TacticsPanelProps) {
  const [localTactics, setLocalTactics] = useState<Tactics>(tactics)

  const handleSliderChange = (key: keyof Tactics, value: number) => {
    setLocalTactics(prev => ({ ...prev, [key]: value }))
  }

  const handleFormationChange = (formation: string) => {
    setLocalTactics(prev => ({ ...prev, formation }))
  }

  const handleReset = () => {
    setLocalTactics(tactics)
  }

  const handleSave = () => {
    onSave?.(localTactics)
  }

  const Slider = ({
    label,
    value,
    min = 0,
    max = 100,
    onChange,
    colorClass = 'bg-primary'
  }: {
    label: string
    value: number
    min?: number
    max?: number
    onChange: (value: number) => void
    colorClass?: string
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={cn('font-bold', value >= 80 ? 'text-green-500' : value <= 20 ? 'text-red-500' : '')}>
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )

  const PitchPosition = ({ player, index }: { player: Player; index: number }) => {
    const positionPositions = {
      '4-4-2': [
        { top: '85%', left: '50%' },
        { top: '65%', left: '15%' }, { top: '65%', left: '38.33%' }, { top: '65%', left: '61.66%' }, { top: '65%', left: '85%' },
        { top: '40%', left: '15%' }, { top: '40%', left: '38.33%' }, { top: '40%', left: '61.66%' }, { top: '40%', left: '85%' },
        { top: '15%', left: '35%' }, { top: '15%', left: '65%' }
      ],
      '4-3-3': [
        { top: '85%', left: '50%' },
        { top: '65%', left: '15%' }, { top: '65%', left: '38.33%' }, { top: '65%', left: '61.66%' }, { top: '65%', left: '85%' },
        { top: '45%', left: '25%' }, { top: '40%', left: '50%' }, { top: '45%', left: '75%' },
        { top: '18%', left: '20%' }, { top: '15%', left: '50%' }, { top: '18%', left: '80%' }
      ],
      '3-5-2': [
        { top: '85%', left: '50%' },
        { top: '65%', left: '25%' }, { top: '65%', left: '50%' }, { top: '65%', left: '75%' },
        { top: '45%', left: '10%' }, { top: '45%', left: '30%' }, { top: '40%', left: '50%' }, { top: '45%', left: '70%' }, { top: '45%', left: '90%' },
        { top: '15%', left: '35%' }, { top: '15%', left: '65%' }
      ]
    }

    const positions = positionPositions[localTactics.formation as keyof typeof positionPositions] || positionPositions['4-4-2']
    const pos = positions[index] || { top: '50%', left: '50%' }

    return (
      <div
        className="absolute w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform"
        style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}
      >
        {player.overall}
      </div>
    )
  }

  const startingPlayers = localTactics.startingXI
    .map(id => players.find(p => p.id === id))
    .filter(Boolean) as Player[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tactics</h2>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Formation</label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {formations.map(formation => (
            <button
              key={formation}
              onClick={() => handleFormationChange(formation)}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                localTactics.formation === formation
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border hover:border-primary'
              )}
            >
              {formation}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 overflow-hidden">
        <div className="relative aspect-[3/4] bg-green-600 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 border-2 border-white/30 rounded-full" />
          </div>
          <div className="absolute inset-0 border-2 border-white/30">
            <div className="absolute inset-x-0 top-1/2 border-t border-white/30" />
            <div className="absolute inset-y-0 left-1/2 border-l border-white/30" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-white/30 rounded-b-full" />
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-16 h-32 border-2 border-white/30 rounded-r-full" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-16 h-32 border-2 border-white/30 rounded-l-full" />
          </div>
          {startingPlayers.slice(0, 11).map((player, i) => (
            <PitchPosition key={player.id} player={player} index={i} />
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <Slider
          label="Attacking"
          value={localTactics.attacking}
          onChange={value => handleSliderChange('attacking', value)}
        />
        <Slider
          label="Defending"
          value={localTactics.defending}
          onChange={value => handleSliderChange('defending', value)}
        />
        <Slider
          label="Possession"
          value={localTactics.possession}
          onChange={value => handleSliderChange('possession', value)}
        />
        <Slider
          label="Pressing"
          value={localTactics.pressing}
          onChange={value => handleSliderChange('pressing', value)}
        />
        <Slider
          label="Tempo"
          value={localTactics.tempo}
          onChange={value => handleSliderChange('tempo', value)}
        />
      </div>
    </div>
  )
}
