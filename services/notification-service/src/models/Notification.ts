import mongoose, { Schema, Document, Model } from 'mongoose'

export type NotificationType = 'match_start' | 'match_end' | 'transfer_complete' | 'injury_report' | 'training_complete' | 'financial_report' | 'youth_player_generated'

export type Priority = 'low' | 'normal' | 'high'

export interface INotification extends Document {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: Date
  priority: Priority
}

const NotificationSchema: Schema = new Schema({
  userId: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['match_start', 'match_end', 'transfer_complete', 'injury_report', 'training_complete', 'financial_report', 'youth_player_generated']
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: Schema.Types.Mixed, default: null },
  read: { type: Boolean, default: false },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  }
}, {
  timestamps: true
})

NotificationSchema.index({ userId: 1, read: 1 })
NotificationSchema.index({ createdAt: -1 })

export const Notification: Model<INotification> = mongoose.model<INotification>('Notification', NotificationSchema)
