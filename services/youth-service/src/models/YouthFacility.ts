import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IYouthFacility extends Document {
  clubId: string
  level: number
  lastGenerationDate: Date
  upgradeHistory: {
    date: Date
    fromLevel: number
    toLevel: number
  }[]
}

const YouthFacilitySchema: Schema = new Schema({
  clubId: { type: String, required: true, unique: true },
  level: { type: Number, required: true, min: 1, max: 5, default: 1 },
  lastGenerationDate: { type: Date, required: true, default: Date.now },
  upgradeHistory: [{
    date: { type: Date, required: true },
    fromLevel: { type: Number, required: true },
    toLevel: { type: Number, required: true }
  }]
}, {
  timestamps: true
})

YouthFacilitySchema.index({ clubId: 1 }, { unique: true })
YouthFacilitySchema.index({ level: 1 })
YouthFacilitySchema.index({ lastGenerationDate: -1 })

export const YouthFacility: Model<IYouthFacility> = mongoose.model<IYouthFacility>('YouthFacility', YouthFacilitySchema)
