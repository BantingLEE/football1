'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin } from 'lucide-react'

interface Fixture {
  id: string
  homeTeam: string
  awayTeam: string
  date: Date
  time: string
  venue: string
  competition: string
}

const mockFixtures: Fixture[] = [
  {
    id: '1',
    homeTeam: 'Your Club',
    awayTeam: 'Manchester United',
    date: new Date('2026-01-27'),
    time: '15:00',
    venue: 'Home Stadium',
    competition: 'Premier League',
  },
  {
    id: '2',
    homeTeam: 'Chelsea',
    awayTeam: 'Your Club',
    date: new Date('2026-02-03'),
    time: '17:30',
    venue: 'Stamford Bridge',
    competition: 'Premier League',
  },
  {
    id: '3',
    homeTeam: 'Your Club',
    awayTeam: 'Arsenal',
    date: new Date('2026-02-10'),
    time: '12:30',
    venue: 'Home Stadium',
    competition: 'Premier League',
  },
  {
    id: '4',
    homeTeam: 'Liverpool',
    awayTeam: 'Your Club',
    date: new Date('2026-02-17'),
    time: '16:00',
    venue: 'Anfield',
    competition: 'Premier League',
  },
  {
    id: '5',
    homeTeam: 'Your Club',
    awayTeam: 'Tottenham',
    date: new Date('2026-02-24'),
    time: '15:00',
    venue: 'Home Stadium',
    competition: 'Premier League',
  },
]

export function FixtureList({ leagueId }: { leagueId: string }) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  const isHomeGame = (team: string) => team === 'Your Club'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Fixtures
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockFixtures.map((fixture) => (
            <div
              key={fixture.id}
              className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">{fixture.competition}</Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {fixture.time}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isHomeGame(fixture.homeTeam) ? 'bg-green-500' : 'bg-transparent'}`} />
                    <span className={`text-sm ${isHomeGame(fixture.homeTeam) ? 'font-semibold' : ''}`}>
                      {fixture.homeTeam}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <span className="text-xs text-muted-foreground font-medium">VS</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isHomeGame(fixture.awayTeam) ? 'bg-green-500' : 'bg-transparent'}`} />
                    <span className={`text-sm ${isHomeGame(fixture.awayTeam) ? 'font-semibold' : ''}`}>
                      {fixture.awayTeam}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{fixture.venue}</span>
                <span className="ml-auto">{formatDate(fixture.date)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
