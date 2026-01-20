'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award } from 'lucide-react'
import { useState } from 'react'

interface TeamStanding {
  position: number
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: string[]
}

const mockStandings: TeamStanding[] = [
  { position: 1, team: 'Manchester City', played: 20, won: 15, drawn: 3, lost: 2, goalsFor: 45, goalsAgainst: 20, goalDifference: 25, points: 48, form: ['W', 'W', 'D', 'W', 'W'] },
  { position: 2, team: 'Arsenal', played: 20, won: 14, drawn: 4, lost: 2, goalsFor: 40, goalsAgainst: 18, goalDifference: 22, points: 46, form: ['W', 'D', 'W', 'W', 'W'] },
  { position: 3, team: 'Liverpool', played: 20, won: 13, drawn: 5, lost: 2, goalsFor: 42, goalsAgainst: 20, goalDifference: 22, points: 44, form: ['D', 'W', 'W', 'D', 'W'] },
  { position: 4, team: 'Aston Villa', played: 20, won: 12, drawn: 4, lost: 4, goalsFor: 35, goalsAgainst: 22, goalDifference: 13, points: 40, form: ['W', 'W', 'L', 'W', 'D'] },
  { position: 5, team: 'Tottenham', played: 20, won: 12, drawn: 3, lost: 5, goalsFor: 38, goalsAgainst: 25, goalDifference: 13, points: 39, form: ['W', 'L', 'W', 'W', 'L'] },
  { position: 6, team: 'Manchester United', played: 20, won: 11, drawn: 3, lost: 6, goalsFor: 32, goalsAgainst: 26, goalDifference: 6, points: 36, form: ['L', 'W', 'D', 'W', 'W'] },
  { position: 7, team: 'West Ham', played: 20, won: 10, drawn: 4, lost: 6, goalsFor: 30, goalsAgainst: 24, goalDifference: 6, points: 34, form: ['W', 'W', 'L', 'D', 'W'] },
  { position: 8, team: 'Brighton', played: 20, won: 10, drawn: 3, lost: 7, goalsFor: 32, goalsAgainst: 28, goalDifference: 4, points: 33, form: ['D', 'W', 'W', 'L', 'W'] },
  { position: 9, team: 'Chelsea', played: 20, won: 9, drawn: 5, lost: 6, goalsFor: 30, goalsAgainst: 27, goalDifference: 3, points: 32, form: ['L', 'D', 'W', 'D', 'W'] },
  { position: 10, team: 'Newcastle', played: 20, won: 9, drawn: 4, lost: 7, goalsFor: 28, goalsAgainst: 26, goalDifference: 2, points: 31, form: ['W', 'L', 'W', 'W', 'L'] },
]

type SortField = 'position' | 'team' | 'played' | 'won' | 'drawn' | 'lost' | 'goalDifference' | 'points'

export function StandingsTable({ leagueId }: { leagueId: string }) {
  const [standings, setStandings] = useState<TeamStanding[]>(mockStandings)
  const [sortField, setSortField] = useState<SortField>('position')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }

    const sorted = [...standings].sort((a, b) => {
      let comparison = 0
      if (a[field] < b[field]) comparison = -1
      if (a[field] > b[field]) comparison = 1
      return sortOrder === 'asc' ? comparison : -comparison
    })

    setStandings(sorted)
  }

  const getFormBadgeColor = (result: string) => {
    switch (result) {
      case 'W':
        return 'bg-green-500 text-white'
      case 'D':
        return 'bg-yellow-500 text-white'
      case 'L':
        return 'bg-red-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />
      case 3:
        return <Award className="h-4 w-4 text-amber-600" />
      default:
        return null
    }
  }

  const getRowBackground = (position: number) => {
    if (position <= 4) return 'bg-green-50 dark:bg-green-950'
    if (position >= mockStandings.length - 3) return 'bg-red-50 dark:bg-red-950'
    return ''
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>League Standings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left cursor-pointer hover:bg-muted/80" onClick={() => handleSort('position')}>
                  Pos
                </th>
                <th className="p-3 text-left cursor-pointer hover:bg-muted/80" onClick={() => handleSort('team')}>
                  Team
                </th>
                <th className="p-3 text-center cursor-pointer hover:bg-muted/80" onClick={() => handleSort('played')}>
                  P
                </th>
                <th className="p-3 text-center cursor-pointer hover:bg-muted/80" onClick={() => handleSort('won')}>
                  W
                </th>
                <th className="p-3 text-center cursor-pointer hover:bg-muted/80" onClick={() => handleSort('drawn')}>
                  D
                </th>
                <th className="p-3 text-center cursor-pointer hover:bg-muted/80" onClick={() => handleSort('lost')}>
                  L
                </th>
                <th className="p-3 text-center cursor-pointer hover:bg-muted/80" onClick={() => handleSort('goalDifference')}>
                  GD
                </th>
                <th className="p-3 text-center cursor-pointer hover:bg-muted/80" onClick={() => handleSort('points')}>
                  Pts
                </th>
                <th className="p-3 text-center">Form</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team) => (
                <tr key={team.position} className={`border-t ${getRowBackground(team.position)} hover:bg-muted/50`}>
                  <td className="p-3 font-medium">
                    <div className="flex items-center gap-2">
                      {getPositionIcon(team.position)}
                      <span>{team.position}</span>
                    </div>
                  </td>
                  <td className="p-3 font-medium">{team.team}</td>
                  <td className="p-3 text-center">{team.played}</td>
                  <td className="p-3 text-center">{team.won}</td>
                  <td className="p-3 text-center">{team.drawn}</td>
                  <td className="p-3 text-center">{team.lost}</td>
                  <td className="p-3 text-center">
                    {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                  </td>
                  <td className="p-3 text-center font-bold">{team.points}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {team.form.map((result, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className={`w-6 h-6 flex items-center justify-center text-xs ${getFormBadgeColor(result)}`}
                        >
                          {result}
                        </Badge>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-6 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 dark:bg-green-900 rounded" />
            <span>Champions League</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 dark:bg-red-900 rounded" />
            <span>Relegation Zone</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
