'use client'

import { Goal, Assist, BadgeX, BadgeAlert, ArrowRightLeft, Activity } from 'lucide-react'
import { MatchEvent } from '@/types'
import { cn } from '@/lib/utils'

interface MatchEventsTimelineProps {
  events: MatchEvent[]
}

export default function MatchEventsTimeline({ events }: MatchEventsTimelineProps) {
  const getEventIcon = (type: MatchEvent['type']) => {
    switch (type) {
      case 'goal':
        return <Goal className="h-5 w-5 text-green-500" />
      case 'assist':
        return <Assist className="h-5 w-5 text-blue-500" />
      case 'yellow_card':
        return <BadgeAlert className="h-5 w-5 text-yellow-500" />
      case 'red_card':
        return <BadgeX className="h-5 w-5 text-red-500" />
      case 'substitution':
        return <ArrowRightLeft className="h-5 w-5 text-purple-500" />
      case 'injury':
        return <Activity className="h-5 w-5 text-orange-500" />
      default:
        return <Activity className="h-5 w-5" />
    }
  }

  const getEventColor = (type: MatchEvent['type']) => {
    switch (type) {
      case 'goal':
        return 'border-green-500 bg-green-500/5'
      case 'assist':
        return 'border-blue-500 bg-blue-500/5'
      case 'yellow_card':
        return 'border-yellow-500 bg-yellow-500/5'
      case 'red_card':
        return 'border-red-500 bg-red-500/5'
      case 'substitution':
        return 'border-purple-500 bg-purple-500/5'
      case 'injury':
        return 'border-orange-500 bg-orange-500/5'
      default:
        return 'border-border bg-card'
    }
  }

  const sortedEvents = [...events].sort((a, b) => b.minute - a.minute)

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Match Events</h3>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No events recorded yet
          </div>
        ) : (
          sortedEvents.map((event, index) => (
            <div
              key={event.id}
              className={cn(
                'relative p-4 rounded-lg border-l-4',
                getEventColor(event.type)
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getEventIcon(event.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-lg">{event.minute}&apos;</span>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      event.teamId === 'home' ? 'bg-primary/20 text-primary' : 'bg-secondary/50 text-secondary-foreground'
                    )}>
                      {event.teamId === 'home' ? 'Home' : 'Away'}
                    </span>
                  </div>

                  <h4 className="font-medium mb-1">{event.playerName}</h4>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              </div>

              {index < sortedEvents.length - 1 && (
                <div className="absolute left-4 top-full h-3 w-px bg-border" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
