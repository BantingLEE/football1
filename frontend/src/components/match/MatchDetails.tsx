'use client'

import { TrendingUp, Target, Activity, Footprints } from 'lucide-react'
import { Match } from '@/types'

interface MatchDetailsProps {
  match: Match
}

export default function MatchDetails({ match }: MatchDetailsProps) {
  const StatBar = ({
    label,
    homeValue,
    awayValue,
    max = 100,
    icon: Icon
  }: {
    label: string
    homeValue: number
    awayValue: number
    max?: number
    icon: any
  }) => {
    const homePercent = (homeValue / max) * 100
    const awayPercent = (awayValue / max) * 100

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{homeValue}%</span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </div>
          <span className="font-medium">{awayValue}%</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${homePercent}%` }}
            />
          </div>
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${awayPercent}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Match Statistics</h3>

      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <StatBar
          label="Possession"
          homeValue={match.homeStats.possession}
          awayValue={match.awayStats.possession}
          icon={TrendingUp}
        />

        <StatBar
          label="Shots"
          homeValue={match.homeStats.shots}
          awayValue={match.awayStats.shots}
          max={Math.max(match.homeStats.shots, match.awayStats.shots, 20)}
          icon={Target}
        />

        <StatBar
          label="Shots on Target"
          homeValue={match.homeStats.shotsOnTarget}
          awayValue={match.awayStats.shotsOnTarget}
          max={Math.max(match.homeStats.shotsOnTarget, match.awayStats.shotsOnTarget, 15)}
          icon={Target}
        />

        <StatBar
          label="Pass Accuracy"
          homeValue={match.homeStats.passAccuracy}
          awayValue={match.awayStats.passAccuracy}
          icon={Activity}
        />

        <StatBar
          label="Tackles"
          homeValue={match.homeStats.tackles}
          awayValue={match.awayStats.tackles}
          max={Math.max(match.homeStats.tackles, match.awayStats.tackles, 50)}
          icon={Footprints}
        />

        <StatBar
          label="Fouls"
          homeValue={match.homeStats.fouls}
          awayValue={match.awayStats.fouls}
          max={Math.max(match.homeStats.fouls, match.awayStats.fouls, 30)}
          icon={Activity}
        />

        <StatBar
          label="Corners"
          homeValue={match.homeStats.corners}
          awayValue={match.awayStats.corners}
          max={Math.max(match.homeStats.corners, match.awayStats.corners, 15)}
          icon={Target}
        />

        <StatBar
          label="Offsides"
          homeValue={match.homeStats.offsides}
          awayValue={match.awayStats.offsides}
          max={Math.max(match.homeStats.offsides, match.awayStats.offsides, 10)}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold">
                {match.homeTeam.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <span className="font-medium text-sm">{match.homeTeam.name}</span>
          </div>
          <div className="text-2xl font-bold">{match.homeTeam.score}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-end gap-2 mb-2">
            <span className="font-medium text-sm">{match.awayTeam.name}</span>
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold">
                {match.awayTeam.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="text-2xl font-bold text-right">{match.awayTeam.score}</div>
        </div>
      </div>
    </div>
  )
}
