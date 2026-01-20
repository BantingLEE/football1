import mongoose from 'mongoose'
import { Migration } from './runner'

export const migration004AddYouthFacilityIndexes: Migration = {
  name: '004_add_youth_facility_indexes',
  async up() {
    await mongoose.connection.db.collection('youthfacilities').createIndex({ clubId: 1 }, { unique: true })
    await mongoose.connection.db.collection('youthfacilities').createIndex({ level: 1 })
    await mongoose.connection.db.collection('youthfacilities').createIndex({ lastGenerationDate: -1 })
    console.log('Youth Facility indexes created')
  },
  async down() {
    await mongoose.connection.db.collection('youthfacilities').dropIndex({ clubId: 1 })
    await mongoose.connection.db.collection('youthfacilities').dropIndex({ level: 1 })
    await mongoose.connection.db.collection('youthfacilities').dropIndex({ lastGenerationDate: -1 })
    console.log('Youth Facility indexes dropped')
  }
}
