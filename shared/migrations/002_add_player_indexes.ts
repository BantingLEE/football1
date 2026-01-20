import mongoose from 'mongoose'
import { Migration } from './runner'

export const migration002AddPlayerIndexes: Migration = {
  name: '002_add_player_indexes',
  async up() {
    await mongoose.connection.db.collection('players').createIndex({ clubId: 1 })
    await mongoose.connection.db.collection('players').createIndex({ position: 1 })
    await mongoose.connection.db.collection('players').createIndex({ age: 1 })
    await mongoose.connection.db.collection('players').createIndex({ nationality: 1 })
    await mongoose.connection.db.collection('players').createIndex({ clubId: 1, position: 1 })
    await mongoose.connection.db.collection('players').createIndex({ 'contract.expiresAt': 1 })
    await mongoose.connection.db.collection('players').createIndex({ 'injury.isInjured': 1 })
    await mongoose.connection.db.collection('players').createIndex({ isYouth: 1 })
    console.log('Player indexes created')
  },
  async down() {
    await mongoose.connection.db.collection('players').dropIndex({ clubId: 1 })
    await mongoose.connection.db.collection('players').dropIndex({ position: 1 })
    await mongoose.connection.db.collection('players').dropIndex({ age: 1 })
    await mongoose.connection.db.collection('players').dropIndex({ nationality: 1 })
    await mongoose.connection.db.collection('players').dropIndex({ clubId: 1, position: 1 })
    await mongoose.connection.db.collection('players').dropIndex({ 'contract.expiresAt': 1 })
    await mongoose.connection.db.collection('players').dropIndex({ 'injury.isInjured': 1 })
    await mongoose.connection.db.collection('players').dropIndex({ isYouth: 1 })
    console.log('Player indexes dropped')
  }
}
