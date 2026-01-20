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
