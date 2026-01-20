'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Radio, Clock } from 'lucide-react'
import MatchList from '@/components/match/MatchList'
import LiveMatch from '@/components/match/LiveMatch'
import { Match } from '@/types'

export default function MatchesPage() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)

  const [matches, setMatches] = useState<Match[]>([
    {
      id: '1',
      homeTeam: {
        id: '1',
        name: 'FC Manager United',
        logo: '/logo1.png',
        score: 2
      },
      awayTeam: {
        id: '2',
        name: 'Rival FC',
        logo: '/logo2.png',
        score: 1
      },
      date: new Date(Date.now() - 30 * 60 * 1000),
      status: 'live',
      minute: 67,
      competition: 'Premier League',
      events: [
        {
          id: 'e1',
          type: 'goal',
          minute: 23,
          playerId: 'p1',
          playerName: 'John Smith',
          teamId: 'home',
          description: 'Goal! Brilliant header from a corner kick'
        },
        {
          id: 'e2',
          type: 'yellow_card',
          minute: 35,
          playerId: 'p2',
          playerName: 'Mike Johnson',
          teamId: 'away',
          description: 'Yellow card for a tactical foul'
        },
        {
          id: 'e3',
          type: 'goal',
          minute: 52,
          playerId: 'p3',
          playerName: 'David Brown',
          teamId: 'away',
          description: 'Goal! Low shot from outside the box'
        },
        {
          id: 'e4',
          type: 'goal',
          minute: 61,
          playerId: 'p1',
          playerName: 'John Smith',
          teamId: 'home',
          description: 'Goal! Penalty kick'
        }
      ],
      homeStats: {
        possession: 55,
        shots: 12,
        shotsOnTarget: 6,
        passes: 423,
        passAccuracy: 87,
        tackles: 18,
        fouls: 8,
        corners: 5,
        offsides: 2
      },
      awayStats: {
        possession: 45,
        shots: 8,
        shotsOnTarget: 3,
        passes: 345,
        passAccuracy: 82,
        tackles: 15,
        fouls: 12,
        corners: 3,
        offsides: 4
      }
    },
    {
      id: '2',
      homeTeam: {
        id: '1',
        name: 'FC Manager United',
        logo: '/logo1.png',
        score: 0
      },
      awayTeam: {
        id: '3',
        name: 'City FC',
        logo: '/logo3.png',
        score: 0
      },
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'scheduled',
      competition: 'Champions League',
      events: [],
      homeStats: {
        possession: 0,
        shots: 0,
        shotsOnTarget: 0,
        passes: 0,
        passAccuracy: 0,
        tackles: 0,
        fouls: 0,
        corners: 0,
        offsides: 0
      },
      awayStats: {
        possession: 0,
        shots: 0,
        shotsOnTarget: 0,
        passes: 0,
        passAccuracy: 0,
        tackles: 0,
        fouls: 0,
        corners: 0,
        offsides: 0
      }
    },
    {
      id: '3',
      homeTeam: {
        id: '4',
        name: 'Athletic Club',
        logo: '/logo4.png',
        score: 1
      },
      awayTeam: {
        id: '1',
        name: 'FC Manager United',
        logo: '/logo1.png',
        score: 3
      },
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'finished',
      competition: 'Premier League',
      events: [
        {
          id: 'e5',
          type: 'goal',
          minute: 15,
          playerId: 'p4',
          playerName: 'Tom Wilson',
          teamId: 'away',
          description: 'Goal! Quick counter attack'
        },
        {
          id: 'e6',
          type: 'goal',
          minute: 33,
          playerId: 'p5',
          playerName: 'Alex Turner',
          teamId: 'home',
          description: 'Goal! Solo effort'
        },
        {
          id: 'e7',
          type: 'substitution',
          minute: 55,
          playerId: 'p6',
          playerName: 'James Lee',
          teamId: 'away',
          description: 'Tactical substitution'
        },
        {
          id: 'e8',
          type: 'goal',
          minute: 72,
          playerId: 'p4',
          playerName: 'Tom Wilson',
          teamId: 'away',
          description: 'Goal! Header from a cross'
        },
        {
          id: 'e9',
          type: 'red_card',
          minute: 78,
          playerId: 'p7',
          playerName: 'Chris Harris',
          teamId: 'home',
          description: 'Red card for serious foul'
        },
        {
          id: 'e10',
          type: 'goal',
          minute: 89,
          playerId: 'p4',
          playerName: 'Tom Wilson',
          teamId: 'away',
          description: 'Goal! Hat trick!'
        }
      ],
      homeStats: {
        possession: 48,
        shots: 9,
        shotsOnTarget: 4,
        passes: 378,
        passAccuracy: 84,
        tackles: 14,
        fouls: 14,
        corners: 4,
        offsides: 3
      },
      awayStats: {
        possession: 52,
        shots: 15,
        shotsOnTarget: 8,
        passes: 412,
        passAccuracy: 86,
        tackles: 16,
        fouls: 11,
        corners: 7,
        offsides: 2
      }
    }
  ])

  const liveMatch = matches.find(m => m.status === 'live')
  const upcomingMatches = matches.filter(m => m.status === 'scheduled')
  const pastMatches = matches.filter(m => m.status === 'finished')

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Match Center</h1>
          <p className="text-muted-foreground">Follow your team&apos;s matches in real-time</p>
        </div>

        {liveMatch && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Radio className="h-5 w-5 text-red-500 animate-pulse" />
              <h2 className="text-xl font-bold">Live Now</h2>
            </div>
            <LiveMatch match={liveMatch} />
          </div>
        )}

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Radio className="h-4 w-4" />
              Live
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Past
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <MatchList matches={matches} onMatchClick={setSelectedMatch} />
          </TabsContent>

          <TabsContent value="live">
            <MatchList matches={matches} filterStatus="live" onMatchClick={setSelectedMatch} />
          </TabsContent>

          <TabsContent value="upcoming">
            <MatchList matches={matches} filterStatus="scheduled" onMatchClick={setSelectedMatch} />
          </TabsContent>

          <TabsContent value="past">
            <MatchList matches={matches} filterStatus="finished" onMatchClick={setSelectedMatch} />
          </TabsContent>
        </Tabs>

        {selectedMatch && selectedMatch.status !== 'live' && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Match Details</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold">
                      {selectedMatch.homeTeam.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-bold text-lg">{selectedMatch.homeTeam.name}</span>
                </div>
                <div className="text-3xl font-bold">
                  {selectedMatch.homeTeam.score} - {selectedMatch.awayTeam.score}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">{selectedMatch.awayTeam.name}</span>
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold">
                      {selectedMatch.awayTeam.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-center text-muted-foreground mb-4">{selectedMatch.competition}</p>
              <p className="text-center text-sm text-muted-foreground">
                {new Date(selectedMatch.date).toLocaleString('en-US', {
                  dateStyle: 'full',
                  timeStyle: 'short'
                })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
