import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IGrowthLogEntry {
  date: Date
  attributes: {
    speed: number
    shooting: number
    passing: number
    defending: number
    physical: number
    technical: number
    mental: number
    goalkeeping?: number
  }
  currentAbility: number
}

export interface IPlayer extends Document {
  name: string
  age: number
  nationality: string
  height: number
  weight: number
  position: string
  attributes: {
    speed: number
    shooting: number
    passing: number
    defending: number
    physical: number
    technical: number
    mental: number
    goalkeeping?: number
  }
  potential: number
  currentAbility: number
  contract: {
    salary: number
    expiresAt: Date
    bonus: number
  }
  injury?: {
    isInjured: boolean
    type: string
    recoveryTime: number
  }
  history: {
    matchesPlayed: number
    goals: number
    assists: number
    growthLog: IGrowthLogEntry[]
  }
  clubId?: string
  isYouth?: boolean
}

const PlayerSchema: Schema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true, min: 14, max: 40 },
  nationality: { type: String, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  position: {
    type: String,
    required: true,
    enum: ['GK', 'CB', 'RB', 'LB', 'CDM', 'CM', 'CAM', 'RM', 'LM', 'ST', 'CF', 'LW', 'RW']
  },
  attributes: {
    speed: { type: Number, min: 0, max: 99, default: 50 },
    shooting: { type: Number, min: 0, max: 99, default: 50 },
    passing: { type: Number, min: 0, max: 99, default: 50 },
    defending: { type: Number, min: 0, max: 99, default: 50 },
    physical: { type: Number, min: 0, max: 99, default: 50 },
    technical: { type: Number, min: 0, max: 99, default: 50 },
    mental: { type: Number, min: 0, max: 99, default: 50 },
    goalkeeping: { type: Number, min: 0, max: 99, default: 50 }
  },
  potential: { type: Number, min: 0, max: 99, required: true },
  currentAbility: { type: Number, min: 0, max: 99, required: true },
  contract: {
    salary: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    bonus: { type: Number, default: 0 }
  },
  injury: {
    isInjured: { type: Boolean, default: false },
    type: String,
    recoveryTime: { type: Number, default: 0 }
  },
  history: {
    matchesPlayed: { type: Number, default: 0 },
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    growthLog: [{ type: Object }]
  },
  clubId: { type: Schema.Types.ObjectId, ref: 'Club' },
  isYouth: { type: Boolean, default: false }
}, {
  timestamps: true
})

PlayerSchema.index({ clubId: 1 })
PlayerSchema.index({ position: 1 })
PlayerSchema.index({ age: 1 })
PlayerSchema.index({ nationality: 1 })
PlayerSchema.index({ clubId: 1, position: 1 })
PlayerSchema.index({ contract: { expiresAt: 1 } })
PlayerSchema.index({ 'injury.isInjured': 1 })
PlayerSchema.index({ isYouth: 1 })

PlayerSchema.pre('save', function(next) {
  const player = this as any
  if (player.position === 'GK' && !player.attributes.goalkeeping) {
    player.attributes.goalkeeping = player.attributes.defending
  }
  next()
})

export const Player: Model<IPlayer> = mongoose.model<IPlayer>('Player', PlayerSchema)