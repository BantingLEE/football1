'use client'

import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { Radio } from 'lucide-react'
import { cn } from '@/lib/utils'
import Scoreboard from './Scoreboard'
import MatchEventsTimeline from './MatchEventsTimeline'
import MatchDetails from './MatchDetails'
import { Match } from '@/types'

interface LiveMatchProps {
  match: Match
}

export default function LiveMatch({ match: initialMatch }: LiveMatchProps) {
  const [match, setMatch] = useState<Match>(initialMatch)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket', 'polling']
    })

    socket.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to match socket')
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from match socket')
    })

    socket.on('match-update', (updatedMatch: Match) => {
      if (updatedMatch.id === match.id) {
        setMatch(updatedMatch)
      }
    })

    socket.emit('join-match', match.id)

    return () => {
      socket.emit('leave-match', match.id)
      socket.disconnect()
    }
  }, [match.id])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Live Match</h2>
        <div className="flex items-center gap-2">
          <div className={cn('flex items-center gap-2 px-3 py-1 rounded-full', isConnected ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500')}>
            <Radio className={cn('h-4 w-4', isConnected && 'animate-pulse')} />
            <span className="text-sm font-medium">{isConnected ? 'Live' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      <Scoreboard match={match} />

      <div className="grid lg:grid-cols-2 gap-6">
        <MatchDetails match={match} />
        <MatchEventsTimeline events={match.events} />
      </div>

      {match.status === 'live' && match.minute && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
          <p className="text-lg font-bold text-primary">
            {match.minute}&apos;
          </p>
          <p className="text-sm text-muted-foreground">Match in progress</p>
        </div>
      )}
    </div>
  )
}
