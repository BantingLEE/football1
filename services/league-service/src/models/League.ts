import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMatch {
  homeClubId: string
  awayClubId: string
  homeGoals?: number
  awayGoals?: number
  played?: boolean
  date?: Date
}

export interface IScheduleRound {
  round: number
  matches: IMatch[]
}

export interface IStanding {
  clubId: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

export interface ILeagueHistory {
  season: string
  winner: {
    clubId: string
    clubName: string
    points: number
  }
  topScorer?: {
    playerId: string
    playerName: string
    goals: number
  }
}

export interface ILeague extends Document {
  name: string
  country: string
  season: {
    start: Date
    end: Date
  }
  rules: {
    promotionSlots: number
    relegationSlots: number
    points: {
      win: number
      draw: number
      loss: number
    }
  }
  standings: IStanding[]
  schedule: IScheduleRound[]
  history: ILeagueHistory[]
  clubs: string[]
  isActive: boolean
}

const MatchSchema: Schema = new Schema({
  homeClubId: { type: Schema.Types.ObjectId, required: true, ref: 'Club' },
  awayClubId: { type: Schema.Types.ObjectId, required: true, ref: 'Club' },
  homeGoals: { type: Number, default: null },
  awayGoals: { type: Number, default: null },
  played: { type: Boolean, default: false },
  date: { type: Date }
})

const ScheduleRoundSchema: Schema = new Schema({
  round: { type: Number, required: true },
  matches: [MatchSchema]
})

const StandingSchema: Schema = new Schema({
  clubId: { type: Schema.Types.ObjectId, required: true, ref: 'Club' },
  played: { type: Number, default: 0 },
  won: { type: Number, default: 0 },
  drawn: { type: Number, default: 0 },
  lost: { type: Number, default: 0 },
  goalsFor: { type: Number, default: 0 },
  goalsAgainst: { type: Number, default: 0 },
  points: { type: Number, default: 0 }
})

const LeagueHistorySchema: Schema = new Schema({
  season: { type: String, required: true },
  winner: {
    clubId: { type: Schema.Types.ObjectId, required: true, ref: 'Club' },
    clubName: { type: String, required: true },
    points: { type: Number, required: true }
  },
  topScorer: {
    playerId: { type: Schema.Types.ObjectId, ref: 'Player' },
    playerName: { type: String },
    goals: { type: Number }
  }
})

const LeagueSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  country: { type: String, required: true },
  season: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  rules: {
    promotionSlots: { type: Number, default: 3 },
    relegationSlots: { type: Number, default: 3 },
    points: {
      win: { type: Number, default: 3 },
      draw: { type: Number, default: 1 },
      loss: { type: Number, default: 0 }
    }
  },
  standings: [StandingSchema],
  schedule: [ScheduleRoundSchema],
  history: [LeagueHistorySchema],
  clubs: [{ type: Schema.Types.ObjectId, ref: 'Club' }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
})

LeagueSchema.index({ name: 1, country: 1 })
LeagueSchema.index({ 'season.start': 1, 'season.end': 1 })

export const League: Model<ILeague> = mongoose.model<ILeague>('League', LeagueSchema)
