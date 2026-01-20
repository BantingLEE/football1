import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  userId: string
  email: string
  name: string
}

const UserSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true }
})

UserSchema.index({ userId: 1 })

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema)
