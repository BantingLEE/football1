import mongoose from 'mongoose'
import { Migration } from './runner'

export const migration001AddClubIndexes: Migration = {
  name: '001_add_club_indexes',
  async up() {
    await mongoose.connection.db.collection('clubs').createIndex({ name: 1 }, { unique: true })
    await mongoose.connection.db.collection('clubs').createIndex({ city: 1 })
    await mongoose.connection.db.collection('clubs').createIndex({ foundedYear: 1 })
    await mongoose.connection.db.collection('clubs').createIndex({ createdAt: -1 })
    console.log('Club indexes created')
  },
  async down() {
    await mongoose.connection.db.collection('clubs').dropIndex({ name: 1 })
    await mongoose.connection.db.collection('clubs').dropIndex({ city: 1 })
    await mongoose.connection.db.collection('clubs').dropIndex({ foundedYear: 1 })
    await mongoose.connection.db.collection('clubs').dropIndex({ createdAt: -1 })
    console.log('Club indexes dropped')
  }
}
