'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface StandingPoint {
  team: string
  points: number
  position: number
}

const mockStandingsData: StandingPoint[] = [
  { team: 'Man City', points: 48, position: 1 },
  { team: 'Arsenal', points: 46, position: 2 },
  { team: 'Liverpool', points: 44, position: 3 },
  { team: 'Aston Villa', points: 40, position: 4 },
  { team: 'Tottenham', points: 39, position: 5 },
  { team: 'Man United', points: 36, position: 6 },
  { team: 'West Ham', points: 34, position: 7 },
  { team: 'Brighton', points: 33, position: 8 },
  { team: 'Chelsea', points: 32, position: 9 },
  { team: 'Newcastle', points: 31, position: 10 },
]

export function StandingsChart({ leagueId }: { leagueId: string }) {
  const getBarColor = (position: number) => {
    if (position <= 4) return '#22c55e'
    if (position >= 7 && position <= 10) return '#3b82f6'
    return '#6b7280'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Points Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockStandingsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="team"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip
                formatter={(value) => [`${value} pts`, 'Points']}
                labelFormatter={(label) => `${label}`}
              />
              <Legend />
              <Bar
                dataKey="points"
                name="Points"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              >
                {mockStandingsData.map((entry, index) => (
                  <rect
                    key={`bar-${index}`}
                    fill={getBarColor(entry.position)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Top 4 (Champions League)
              </span>
              <div className="w-3 h-3 bg-green-500 rounded" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {mockStandingsData.slice(0, 4).reduce((sum, team) => sum + team.points, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total points</p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Mid-table
              </span>
              <div className="w-3 h-3 bg-blue-500 rounded" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {mockStandingsData.slice(4, 8).reduce((sum, team) => sum + team.points, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total points</p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                Lower table
              </span>
              <div className="w-3 h-3 bg-gray-500 rounded" />
            </div>
            <div className="text-2xl font-bold text-gray-600">
              {mockStandingsData.slice(8).reduce((sum, team) => sum + team.points, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total points</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">League Statistics</h4>
          <div className="grid gap-4 md:grid-cols-4 text-sm">
            <div>
              <div className="text-muted-foreground">Average Points</div>
              <div className="text-lg font-bold">
                {Math.round(mockStandingsData.reduce((sum, team) => sum + team.points, 0) / mockStandingsData.length)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Highest Points</div>
              <div className="text-lg font-bold">
                {Math.max(...mockStandingsData.map(t => t.points))}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Lowest Points</div>
              <div className="text-lg font-bold">
                {Math.min(...mockStandingsData.map(t => t.points))}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Points Gap (1st-10th)</div>
              <div className="text-lg font-bold">
                {mockStandingsData[0].points - mockStandingsData[mockStandingsData.length - 1].points}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
