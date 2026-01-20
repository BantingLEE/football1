'use client'

import { Select } from '@/components/ui/select'

interface League {
  id: string
  name: string
  country: string
}

const leagues: League[] = [
  { id: 'premier-league', name: 'Premier League', country: 'England' },
  { id: 'la-liga', name: 'La Liga', country: 'Spain' },
  { id: 'bundesliga', name: 'Bundesliga', country: 'Germany' },
  { id: 'serie-a', name: 'Serie A', country: 'Italy' },
  { id: 'ligue-1', name: 'Ligue 1', country: 'France' },
]

interface LeagueSelectorProps {
  selectedLeague: string
  onLeagueChange: (leagueId: string) => void
}

export function LeagueSelector({ selectedLeague, onLeagueChange }: LeagueSelectorProps) {
  return (
    <div className="w-[250px]">
      <label htmlFor="league-select" className="sr-only">
        Select league
      </label>
      <Select
        id="league-select"
        value={selectedLeague}
        onChange={(e) => onLeagueChange(e.target.value)}
        className="w-full"
      >
        <option value="" disabled>
          Select a league
        </option>
        {leagues.map((league) => (
          <option key={league.id} value={league.id}>
            {league.name} ({league.country})
          </option>
        ))}
      </Select>
    </div>
  )
}
