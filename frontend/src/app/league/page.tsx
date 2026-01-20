'use client'

import { useState } from 'react'
import { StandingsTable } from '@/components/league/StandingsTable'
import { FixtureList } from '@/components/league/FixtureList'
import { ResultsList } from '@/components/league/ResultsList'
import { LeagueSelector } from '@/components/league/LeagueSelector'
import { StandingsChart } from '@/components/league/StandingsChart'

export default function LeaguePage() {
  const [selectedLeague, setSelectedLeague] = useState('premier-league')

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold tracking-tight">League Standings</h1>
            <LeagueSelector
              selectedLeague={selectedLeague}
              onLeagueChange={setSelectedLeague}
            />
          </div>
          <p className="text-muted-foreground">View league table, fixtures, and results</p>
        </div>

        <div className="grid gap-6">
          <StandingsTable leagueId={selectedLeague} />

          <div className="grid gap-6 md:grid-cols-2">
            <FixtureList leagueId={selectedLeague} />
            <ResultsList leagueId={selectedLeague} />
          </div>

          <StandingsChart leagueId={selectedLeague} />
        </div>
      </div>
    </div>
  )
}
