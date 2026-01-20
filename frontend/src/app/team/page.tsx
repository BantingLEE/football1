'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Settings, ArrowLeftRight } from 'lucide-react'
import SquadList from '@/components/team/SquadList'
import TacticsPanel from '@/components/team/TacticsPanel'
import SubstitutionsPanel from '@/components/team/SubstitutionsPanel'
import { Team, Player, Tactics } from '@/types'

export default function TeamPage() {
  const [team, setTeam] = useState<Team>({
    id: '1',
    name: 'FC Manager United',
    logo: '/logo.png',
    stadium: 'Digital Arena',
    founded: 2024,
    budget: 50000000,
    players: [],
    tactics: {
      formation: '4-4-2',
      attacking: 50,
      defending: 50,
      possession: 50,
      pressing: 50,
      tempo: 50,
      startingXI: [],
      bench: []
    }
  })

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)

  const handleSaveTactics = (tactics: Tactics) => {
    setTeam(prev => ({ ...prev, tactics }))
  }

  const handleSubstitute = (playerOut: Player, playerIn: Player) => {
    setTeam(prev => {
      const newStartingXI = prev.tactics.startingXI.filter(id => id !== playerOut.id)
      const newBench = prev.tactics.bench.filter(id => id !== playerIn.id)
      
      return {
        ...prev,
        tactics: {
          ...prev.tactics,
          startingXI: [...newStartingXI, playerIn.id],
          bench: [...newBench, playerOut.id]
        }
      }
    })
  }

  const startingPlayers = team.players.filter(p => team.tactics.startingXI.includes(p.id))
  const benchPlayers = team.players.filter(p => team.tactics.bench.includes(p.id))

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{team.name}</h1>
          <p className="text-muted-foreground">{team.stadium} • Est. {team.founded}</p>
          <p className="text-2xl font-bold text-green-500 mt-2">
            €{(team.budget / 1000000).toFixed(1)}M Budget
          </p>
        </div>

        <Tabs defaultValue="squad" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="squad" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Squad
            </TabsTrigger>
            <TabsTrigger value="tactics" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Tactics
            </TabsTrigger>
            <TabsTrigger value="subs" className="flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              Subs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="squad">
            <SquadList
              players={team.players}
              onPlayerClick={setSelectedPlayer}
            />
          </TabsContent>

          <TabsContent value="tactics">
            <TacticsPanel
              tactics={team.tactics}
              players={team.players}
              onSave={handleSaveTactics}
            />
          </TabsContent>

          <TabsContent value="subs">
            <SubstitutionsPanel
              startingXI={startingPlayers}
              bench={benchPlayers}
              onSubstitute={handleSubstitute}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
