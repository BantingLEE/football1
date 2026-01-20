'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Match } from '@/types'
import { Calendar, Clock, MapPin } from 'lucide-react'

interface NextMatchProps {
  match: Match | null
  loading?: boolean
}

export function NextMatch({ match, loading }: NextMatchProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Next Match</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!match) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Next Match</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No upcoming matches</p>
        </CardContent>
      </Card>
    )
  }

  const matchDate = new Date(match.date)
  const formattedDate = matchDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const formattedTime = matchDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Next Match</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-muted p-4">
          <div className="text-center flex-1">
            <p className="text-lg font-bold">HOME</p>
            <p className="text-sm text-muted-foreground">{match.homeTeam.clubId}</p>
          </div>
          <div className="px-4">
            <span className="text-2xl font-bold">VS</span>
          </div>
          <div className="text-center flex-1">
            <p className="text-lg font-bold">AWAY</p>
            <p className="text-sm text-muted-foreground">{match.awayTeam.clubId}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formattedTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>TBD Stadium</span>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary text-primary-foreground">
            {match.status}
          </span>
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground">
            {match.homeTeam.tactics.formation}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
