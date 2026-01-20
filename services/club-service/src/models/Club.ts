import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IClub extends Document {
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
    incomeHistory: any[]
    expenseHistory: any[]
  }
  youthFacility: {
    level: number
    capacity: number
    trainingQuality: number
  }
  tacticalPreference: {
    formation: string
    attacking: number
    defending: number
  }
}

const ClubSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  foundedYear: { type: Number, required: true },
  city: { type: String, required: true },
  stadium: {
    name: { type: String, required: true },
    capacity: { type: Number, required: true }
  },
  finances: {
    budget: { type: Number, default: 50000000 },
    cash: { type: Number, default: 30000000 },
    incomeHistory: [{ type: Object }],
    expenseHistory: [{ type: Object }]
  },
  youthFacility: {
    level: { type: Number, default: 1, min: 1, max: 5 },
    capacity: { type: Number, default: 10 },
    trainingQuality: { type: Number, default: 0.3 }
  },
  tacticalPreference: {
    formation: { type: String, default: '4-4-2' },
    attacking: { type: Number, default: 50, min: 0, max: 100 },
    defending: { type: Number, default: 50, min: 0, max: 100 }
  }
}, {
  timestamps: true
})

export const Club: Model<IClub> = mongoose.model<IClub>('Club', ClubSchema)
