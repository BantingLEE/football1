'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Trophy, TrendingUp, TrendingDown } from 'lucide-react'

interface MatchResult {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  date: Date
  venue: string
  competition: string
  isUserTeam?: boolean
  result?: 'win' | 'draw' | 'loss'
}

const mockResults: MatchResult[] = [
  {
    id: '1',
    homeTeam: 'Your Club',
    awayTeam: 'Manchester City',
    homeScore: 2,
    awayScore: 1,
    date: new Date('2026-01-20'),
    venue: 'Home Stadium',
    competition: 'Premier League',
    isUserTeam: true,
    result: 'win',
  },
  {
    id: '2',
    homeTeam: 'Liverpool',
    awayTeam: 'Your Club',
    homeScore: 1,
    awayScore: 1,
    date: new Date('2026-01-13'),
    venue: 'Anfield',
    competition: 'Premier League',
    isUserTeam: true,
    result: 'draw',
  },
  {
    id: '3',
    homeTeam: 'Your Club',
    awayTeam: 'Chelsea',
    homeScore: 3,
    awayScore: 0,
    date: new Date('2026-01-06'),
    venue: 'Home Stadium',
    competition: 'Premier League',
    isUserTeam: true,
    result: 'win',
  },
  {
    id: '4',
    homeTeam: 'Arsenal',
    awayTeam: 'Your Club',
    homeScore: 2,
    awayScore: 0,
    date: new Date('2025-12-30'),
    venue: 'Emirates Stadium',
    competition: 'Premier League',
    isUserTeam: true,
    result: 'loss',
  },
  {
    id: '5',
    homeTeam: 'Your Club',
    awayTeam: 'Tottenham',
    homeScore: 1,
    awayScore: 1,
    date: new Date('2025-12-26'),
    venue: 'Home Stadium',
    competition: 'Premier League',
    isUserTeam: true,
    result: 'draw',
  },
]

export function ResultsList({ leagueId }: { leagueId: string }) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  const getResultBadge = (result?: 'win' | 'draw' | 'loss') => {
    if (!result) return null
    switch (result) {
      case 'win':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <TrendingUp className="h-3 w-3 mr-1" />
            Win
          </Badge>
        )
      case 'draw':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            Draw
          </Badge>
        )
      case 'loss':
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <TrendingDown className="h-3 w-3 mr-1" />
            Loss
          </Badge>
        )
    }
  }

  const isHomeGame = (team: string) => team === 'Your Club'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockResults.map((match) => (
            <div
              key={match.id}
              className={`p-4 rounded-lg hover:shadow-md transition-shadow ${
                match.isUserTeam ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline">{match.competition}</Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(match.date)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isHomeGame(match.homeTeam) ? 'bg-primary' : 'bg-muted'}`} />
                    <span className={`text-sm ${isHomeGame(match.homeTeam) ? 'font-semibold' : ''}`}>
                      {match.homeTeam}
                    </span>
                  </div>
                  <span className="text-2xl font-bold">{match.homeScore}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isHomeGame(match.awayTeam) ? 'bg-primary' : 'bg-muted'}`} />
                    <span className={`text-sm ${isHomeGame(match.awayTeam) ? 'font-semibold' : ''}`}>
                      {match.awayTeam}
                    </span>
                  </div>
                  <span className="text-2xl font-bold">{match.awayScore}</span>
                </div>
              </div>

              {match.isUserTeam && getResultBadge(match.result)}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last 5 Games</span>
            <div className="flex gap-1">
              {mockResults.slice(0, 5).map((match, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className={`w-8 h-8 flex items-center justify-center ${
                    match.result === 'win' ? 'bg-green-500 text-white' :
                    match.result === 'draw' ? 'bg-yellow-500 text-white' :
                    'bg-red-500 text-white'
                  }`}
                >
                  {match.result === 'win' ? 'W' : match.result === 'draw' ? 'D' : 'L'}
                </Badge>
              ))}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
              <div className="text-lg font-bold text-green-600">
                {mockResults.filter(r => r.result === 'win').length}
              </div>
              <div className="text-xs text-muted-foreground">Wins</div>
            </div>
            <div className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
              <div className="text-lg font-bold text-yellow-600">
                {mockResults.filter(r => r.result === 'draw').length}
              </div>
              <div className="text-xs text-muted-foreground">Draws</div>
            </div>
            <div className="p-2 bg-red-50 dark:bg-red-950 rounded">
              <div className="text-lg font-bold text-red-600">
                {mockResults.filter(r => r.result === 'loss').length}
              </div>
              <div className="text-xs text-muted-foreground">Losses</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
