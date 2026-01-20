'use client'

import { useState } from 'react'
import { Calendar, Filter, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Match } from '@/types'

interface MatchListProps {
  matches: Match[]
  onMatchClick?: (match: Match) => void
  filterStatus?: 'all' | 'scheduled' | 'live' | 'finished'
}

export default function MatchList({ matches, onMatchClick, filterStatus = 'all' }: MatchListProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState(filterStatus)
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all')

  const filteredMatches = matches.filter(match => {
    const matchesSearch =
      match.homeTeam.name.toLowerCase().includes(search.toLowerCase()) ||
      match.awayTeam.name.toLowerCase().includes(search.toLowerCase()) ||
      match.competition.toLowerCase().includes(search.toLowerCase())

    const matchesFilter = filter === 'all' || match.status === filter

    const now = new Date()
    const matchDate = new Date(match.date)
    let matchesDate = true

    if (dateRange === 'today') {
      matchesDate = matchDate.toDateString() === now.toDateString()
    } else if (dateRange === 'week') {
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      matchesDate = matchDate >= now && matchDate <= weekFromNow
    } else if (dateRange === 'month') {
      const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      matchesDate = matchDate >= now && matchDate <= monthFromNow
    }

    return matchesSearch && matchesFilter && matchesDate
  })

  const formatDate = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const statusColors = {
    scheduled: 'text-muted-foreground',
    live: 'text-green-500 font-bold',
    finished: 'text-muted-foreground',
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search matches..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-card border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="finished">Finished</option>
          </select>

          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value as any)}
            className="px-4 py-2 bg-card border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredMatches.map(match => (
          <div
            key={match.id}
            onClick={() => onMatchClick?.(match)}
            className={cn(
              'p-4 bg-card border border-border rounded-lg cursor-pointer',
              'hover:border-primary transition-colors',
              match.status === 'live' && 'border-green-500 bg-green-500/5'
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {formatDate(match.date)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-secondary rounded">
                  {match.competition}
                </span>
                <span className={cn('text-sm font-medium', statusColors[match.status])}>
                  {match.status === 'live' && `LIVE ${match.minute}'`}
                  {match.status === 'scheduled' && 'Upcoming'}
                  {match.status === 'finished' && 'FT'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">{match.homeTeam.name.slice(0, 2).toUpperCase()}</span>
                </div>
                <span className="font-medium">{match.homeTeam.name}</span>
              </div>

              <div className="flex items-center gap-2 px-4">
                <span className={cn(
                  'text-2xl font-bold',
                  match.homeTeam.score > match.awayTeam.score && 'text-green-500',
                  match.homeTeam.score < match.awayTeam.score && 'text-red-500'
                )}>
                  {match.homeTeam.score}
                </span>
                <span className="text-muted-foreground">-</span>
                <span className={cn(
                  'text-2xl font-bold',
                  match.awayTeam.score > match.homeTeam.score && 'text-green-500',
                  match.awayTeam.score < match.homeTeam.score && 'text-red-500'
                )}>
                  {match.awayTeam.score}
                </span>
              </div>

              <div className="flex items-center gap-3 flex-1 justify-end">
                <span className="font-medium">{match.awayTeam.name}</span>
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">{match.awayTeam.name.slice(0, 2).toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No matches found matching your criteria
        </div>
      )}
    </div>
  )
}
