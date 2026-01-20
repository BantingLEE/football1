import mongoose from 'mongoose'
import { Migration } from './runner'

export const migration003AddMatchIndexes: Migration = {
  name: '003_add_match_indexes',
  async up() {
    await mongoose.connection.db.collection('matches').createIndex({ leagueId: 1 })
    await mongoose.connection.db.collection('matches').createIndex({ date: -1 })
    await mongoose.connection.db.collection('matches').createIndex({ status: 1 })
    await mongoose.connection.db.collection('matches').createIndex({ 'homeTeam.clubId': 1 })
    await mongoose.connection.db.collection('matches').createIndex({ 'awayTeam.clubId': 1 })
    await mongoose.connection.db.collection('matches').createIndex({ leagueId: 1, date: -1 })
    await mongoose.connection.db.collection('matches').createIndex({ leagueId: 1, status: 1 })
    await mongoose.connection.db.collection('matches').createIndex({ 'homeTeam.clubId': 1, 'awayTeam.clubId': 1 })
    console.log('Match indexes created')
  },
  async down() {
    await mongoose.connection.db.collection('matches').dropIndex({ leagueId: 1 })
    await mongoose.connection.db.collection('matches').dropIndex({ date: -1 })
    await mongoose.connection.db.collection('matches').dropIndex({ status: 1 })
    await mongoose.connection.db.collection('matches').dropIndex({ 'homeTeam.clubId': 1 })
    await mongoose.connection.db.collection('matches').dropIndex({ 'awayTeam.clubId': 1 })
    await mongoose.connection.db.collection('matches').dropIndex({ leagueId: 1, date: -1 })
    await mongoose.connection.db.collection('matches').dropIndex({ leagueId: 1, status: 1 })
    await mongoose.connection.db.collection('matches').dropIndex({ 'homeTeam.clubId': 1, 'awayTeam.clubId': 1 })
    console.log('Match indexes dropped')
  }
}
