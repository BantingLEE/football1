export interface Player {
  _id: string
  name: string
  age: number
  nationality: string
  height: number
  weight: number
  position: Position
  attributes: PlayerAttributes
  potential: number
  currentAbility: number
  contract: Contract
  injury?: Injury
  history: PlayerHistory
  clubId?: string
  isYouth?: boolean
}

export type Position =
  | 'GK'
  | 'CB'
  | 'RB'
  | 'LB'
  | 'CDM'
  | 'CM'
  | 'CAM'
  | 'RM'
  | 'LM'
  | 'ST'
  | 'CF'
  | 'LW'
  | 'RW'

export interface PlayerAttributes {
  speed: number
  shooting: number
  passing: number
  defending: number
  physical: number
  technical: number
  mental: number
  goalkeeping?: number
}

export interface Contract {
  salary: number
  expiresAt: Date
  bonus: number
}

export interface Injury {
  isInjured: boolean
  type: string
  recoveryTime: number
}

export interface PlayerHistory {
  matchesPlayed: number
  goals: number
  assists: number
  growthLog: GrowthRecord[]
}

export interface GrowthRecord {
  date: Date
  attributes: Partial<PlayerAttributes>
  currentAbility: number
}

export interface Club {
  _id: string
  name: string
  foundedYear: number
  city: string
  stadium: {
    name: string
    capacity: number
  }
  finances: {
    budget: number
    cash: number
    incomeHistory: IncomeRecord[]
    expenseHistory: ExpenseRecord[]
  }
  youthFacility: {
    level: number
    capacity: number
    trainingQuality: number
  }
  tacticalPreference: {
    formation: Formation
    attacking: number
    defending: number
  }
}

export type Formation =
  | '4-4-2'
  | '4-3-3'
  | '3-5-2'
  | '4-2-3-1'
  | '5-3-2'
  | '3-4-3'

export interface IncomeRecord {
  type: 'ticket' | 'broadcast' | 'sponsorship' | 'merchandise' | 'other'
  amount: number
  date: Date
}

export interface ExpenseRecord {
  type: 'wages' | 'transfer' | 'operations' | 'penalty' | 'other'
  amount: number
  date: Date
}

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
  formation: string
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
  details?: Record<string, unknown>
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
