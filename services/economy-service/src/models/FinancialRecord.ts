import mongoose, { Schema, Document, Model } from 'mongoose'

export type IncomeType = 'ticket' | 'broadcast' | 'sponsorship' | 'merchandise' | 'other'
export type ExpenseType = 'wages' | 'transfer' | 'operations' | 'penalty' | 'other'

export interface IFinancialRecord extends Document {
  clubId: string
  recordType: 'income' | 'expense'
  type: IncomeType | ExpenseType
  amount: number
  description?: string
  date: Date
  transferId?: string
}

const FinancialRecordSchema: Schema = new Schema({
  clubId: { type: Schema.Types.ObjectId, required: true, ref: 'Club' },
  recordType: { type: String, required: true, enum: ['income', 'expense'] },
  type: {
    type: String,
    required: true,
    enum: ['ticket', 'broadcast', 'sponsorship', 'merchandise', 'wages', 'transfer', 'operations', 'penalty', 'other']
  },
  amount: { type: Number, required: true, min: 0 },
  description: { type: String, maxlength: 500 },
  date: { type: Date, required: true, default: Date.now },
  transferId: { type: Schema.Types.ObjectId, ref: 'Transfer' }
}, {
  timestamps: true
})

FinancialRecordSchema.index({ clubId: 1, date: -1 })
FinancialRecordSchema.index({ recordType: 1, date: -1 })
FinancialRecordSchema.index({ clubId: 1, recordType: 1, date: -1 })

export const FinancialRecord: Model<IFinancialRecord> = mongoose.model<IFinancialRecord>('FinancialRecord', FinancialRecordSchema)
