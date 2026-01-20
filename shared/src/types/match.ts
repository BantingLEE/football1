export interface Match {
  _id: string
  homeTeam: TeamMatchData
  awayTeam: TeamMatchData
  date: Date
  leagueId: string
  status: MatchStatus
  events: MatchEvent[]
  statistics: MatchStatistics
  playerRatings: Map<string, number>
}

export interface TeamMatchData {
  clubId: string
  score: number
  lineup: string[]
  tactics: TeamTactics
}

export interface TeamTactics {
  formation: Formation
  attacking: number
  defending: number
  playStyle: 'possession' | 'counter' | 'direct'
}

export type MatchStatus = 'scheduled' | 'live' | 'completed' | 'postponed'

export interface MatchEvent {
  minute: number
  type: MatchEventType
  playerId?: string
  teamId: string
  description: string
  details?: any
}

export type MatchEventType =
  | 'goal'
  | 'shot'
  | 'foul'
  | 'corner'
  | 'substitution'
  | 'yellowCard'
  | 'redCard'
  | 'injury'

export interface MatchStatistics {
  possession: { home: number; away: number }
  shots: { home: number; away: number }
  shotsOnTarget: { home: number; away: number }
  corners: { home: number; away: number }
  fouls: { home: number; away: number }
  passes: { home: number; away: number }
}
