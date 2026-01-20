import mongoose, { Schema, Document, Model } from 'mongoose'

export interface TeamTactics {
  formation: string
  attacking: number
  defending: number
  playStyle: string
}

export interface MatchEvent {
  minute: number
  type: string
  playerId?: string
  teamId?: string
  description?: string
  details?: Record<string, unknown>
}

export interface IMatch extends Document {
  homeTeam: {
    clubId: string
    score: number
    lineup: string[]
    tactics: TeamTactics
  }
  awayTeam: {
    clubId: string
    score: number
    lineup: string[]
    tactics: TeamTactics
  }
  date: Date
  leagueId: string
  status: 'scheduled' | 'live' | 'completed' | 'postponed'
  events: MatchEvent[]
  statistics: {
    possession: { home: number; away: number }
    shots: { home: number; away: number }
    shotsOnTarget: { home: number; away: number }
    corners: { home: number; away: number }
    fouls: { home: number; away: number }
    passes: { home: number; away: number }
  }
  playerRatings: Map<string, number>
}

const MatchSchema: Schema = new Schema({
  homeTeam: {
    clubId: { type: Schema.Types.ObjectId, ref: 'Club', required: true },
    score: { type: Number, default: 0 },
    lineup: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
    tactics: {
      formation: { type: String, default: '4-4-2' },
      attacking: { type: Number, default: 50 },
      defending: { type: Number, default: 50 },
      playStyle: { type: String, default: 'possession' }
    }
  },
  awayTeam: {
    clubId: { type: Schema.Types.ObjectId, ref: 'Club', required: true },
    score: { type: Number, default: 0 },
    lineup: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
    tactics: {
      formation: { type: String, default: '4-4-2' },
      attacking: { type: Number, default: 50 },
      defending: { type: Number, default: 50 },
      playStyle: { type: String, default: 'possession' }
    }
  },
  date: { type: Date, required: true },
  leagueId: { type: Schema.Types.ObjectId, ref: 'League', required: true },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'postponed'],
    default: 'scheduled'
  },
  events: [{
    minute: { type: Number, required: true },
    type: { type: String, required: true },
    playerId: { type: Schema.Types.ObjectId, ref: 'Player' },
    teamId: { type: Schema.Types.ObjectId, ref: 'Club' },
    description: { type: String },
    details: { type: Object }
  }],
  statistics: {
    possession: { home: { type: Number, default: 50 }, away: { type: Number, default: 50 } },
    shots: { home: { type: Number, default: 0 }, away: { type: Number, default: 0 } },
    shotsOnTarget: { home: { type: Number, default: 0 }, away: { type: Number, default: 0 } },
    corners: { home: { type: Number, default: 0 }, away: { type: Number, default: 0 } },
    fouls: { home: { type: Number, default: 0 }, away: { type: Number, default: 0 } },
    passes: { home: { type: Number, default: 0 }, away: { type: Number, default: 0 } }
  },
  playerRatings: {
    type: Map,
    of: Number,
    default: new Map()
  }
}, {
  timestamps: true
})

export const Match: Model<IMatch> = mongoose.model<IMatch>('Match', MatchSchema)
