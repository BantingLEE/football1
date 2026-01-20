import mongoose, { Schema, Document, Model } from 'mongoose'

export type TransferType = 'permanent' | 'loan' | 'free'
export type TransferStatus = 'active' | 'pending' | 'completed' | 'cancelled'

export interface ITransfer extends Document {
  playerId: string
  fromClubId: string
  toClubId: string
  transferFee: number
  type: TransferType
  status: TransferStatus
  startDate: Date
  endDate?: Date
  contractLength?: number
}

const TransferSchema: Schema = new Schema({
  playerId: { type: Schema.Types.ObjectId, required: true, ref: 'Player' },
  fromClubId: { type: Schema.Types.ObjectId, required: true, ref: 'Club' },
  toClubId: { type: Schema.Types.ObjectId, required: true, ref: 'Club' },
  transferFee: { type: Number, required: true, min: 0 },
  type: { type: String, required: true, enum: ['permanent', 'loan', 'free'], default: 'permanent' },
  status: { type: String, required: true, enum: ['active', 'pending', 'completed', 'cancelled'], default: 'pending' },
  startDate: { type: Date, required: true, default: Date.now },
  endDate: { type: Date },
  contractLength: { type: Number, min: 1 }
}, {
  timestamps: true
})

TransferSchema.index({ playerId: 1, status: 1 })
TransferSchema.index({ fromClubId: 1, status: 1 })
TransferSchema.index({ toClubId: 1, status: 1 })

export const Transfer: Model<ITransfer> = mongoose.model<ITransfer>('Transfer', TransferSchema)
