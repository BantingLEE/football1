'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Player } from '@/types'
import PlayerCard from './PlayerCard'

interface SquadListProps {
  players: Player[]
  onPlayerClick?: (player: Player) => void
}

export default function SquadList({ players, onPlayerClick }: SquadListProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'GK' | 'DEF' | 'MID' | 'FWD'>('all')
  const [sortBy, setSortBy] = useState<'overall' | 'name' | 'age' | 'rating'>('overall')

  const filteredPlayers = players
    .filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(search.toLowerCase())
      const matchesFilter = filter === 'all' || player.position === filter
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'overall':
          return b.overall - a.overall
        case 'name':
          return a.name.localeCompare(b.name)
        case 'age':
          return a.age - b.age
        case 'rating':
          return b.rating - a.rating
        default:
          return 0
      }
    })

  const positions: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'GK', label: 'GK' },
    { key: 'DEF', label: 'DEF' },
    { key: 'MID', label: 'MID' },
    { key: 'FWD', label: 'FWD' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="pl-10 pr-8 py-2 bg-card border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
            >
              <option value="overall">Sort by Overall</option>
              <option value="name">Sort by Name</option>
              <option value="age">Sort by Age</option>
              <option value="rating">Sort by Rating</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {positions.map(pos => (
          <button
            key={pos.key}
            onClick={() => setFilter(pos.key)}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              filter === pos.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-foreground hover:bg-accent'
            )}
          >
            {pos.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map(player => (
          <PlayerCard
            key={player.id}
            player={player}
            onClick={() => onPlayerClick?.(player)}
          />
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No players found matching your criteria
        </div>
      )}
    </div>
  )
}
