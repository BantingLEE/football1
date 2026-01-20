'use client'

import { Trophy, Clock } from 'lucide-react'
import { Match } from '@/types'
import { cn } from '@/lib/utils'

interface ScoreboardProps {
  match: Match
}

export default function Scoreboard({ match }: ScoreboardProps) {
  const getScoreColor = (homeScore: number, awayScore: number, isHome: boolean) => {
    if (homeScore === awayScore) return ''
    if (isHome) {
      return homeScore > awayScore ? 'text-green-500' : 'text-red-500'
    }
    return awayScore > homeScore ? 'text-green-500' : 'text-red-500'
  }

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 border border-primary/20 rounded-lg p-6 md:p-8">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">{match.competition}</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <div className="text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-lg md:text-xl font-bold text-primary">
              {match.homeTeam.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <h3 className="font-bold text-lg md:text-xl">{match.homeTeam.name}</h3>
        </div>

        <div className="text-center">
          {match.status === 'live' ? (
            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                'flex items-center gap-2 px-4 py-2 bg-green-500 rounded-lg',
                'animate-pulse'
              )}>
                <Clock className="h-4 w-4" />
                <span className="text-lg font-bold">{match.minute}&apos;</span>
              </div>
              <div className="flex items-center gap-4 text-4xl md:text-5xl font-bold">
                <span className={getScoreColor(match.homeTeam.score, match.awayTeam.score, true)}>
                  {match.homeTeam.score}
                </span>
                <span className="text-muted-foreground">:</span>
                <span className={getScoreColor(match.homeTeam.score, match.awayTeam.score, false)}>
                  {match.awayTeam.score}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-4xl md:text-5xl font-bold">
              <span className={getScoreColor(match.homeTeam.score, match.awayTeam.score, true)}>
                {match.homeTeam.score}
              </span>
              <span className="text-muted-foreground">:</span>
              <span className={getScoreColor(match.homeTeam.score, match.awayTeam.score, false)}>
                {match.awayTeam.score}
              </span>
            </div>
          )}

          <div className="mt-2">
            {match.status === 'scheduled' && (
              <span className="text-sm text-muted-foreground">
                {new Date(match.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {match.status === 'finished' && (
              <span className="text-sm text-muted-foreground">Full Time</span>
            )}
          </div>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-lg md:text-xl font-bold text-primary">
              {match.awayTeam.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <h3 className="font-bold text-lg md:text-xl">{match.awayTeam.name}</h3>
        </div>
      </div>

      {match.status === 'live' && match.events.length > 0 && (
        <div className="mt-6 pt-4 border-t border-primary/20">
          <p className="text-sm text-muted-foreground text-center">
            Latest: {match.events[match.events.length - 1].description}
          </p>
        </div>
      )}
    </div>
  )
}
