import { Club, IClub } from '../models/Club'
import mongoose from 'mongoose'
import { Error as MongooseError } from 'mongoose'

export class ClubService {
  async getAllClubs(): Promise<IClub[]> {
    try {
      const clubs = await Club.find().exec()
      return clubs
    } catch (error) {
      throw new Error(`Failed to fetch clubs: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getClubById(id: string): Promise<IClub | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid club ID format')
    }

    try {
      const club = await Club.findById(id).exec()
      return club
    } catch (error) {
      throw new Error(`Failed to fetch club: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async createClub(clubData: Partial<IClub>): Promise<IClub> {
    try {
      const club = await Club.create(clubData)
      return club
    } catch (error) {
      if (error instanceof MongooseError.ValidationError) {
        throw new Error(`Validation error: ${error.message}`)
      }
      if (error instanceof MongooseError && (error as any).code === 11000) {
        throw new Error('Club with this name already exists')
      }
      throw new Error(`Failed to create club: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updateClub(id: string, clubData: Partial<IClub>): Promise<IClub | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid club ID format')
    }

    try {
      const club = await Club.findByIdAndUpdate(id, clubData, { new: true, runValidators: true }).exec()
      if (!club) {
        throw new Error('Club not found')
      }
      return club
    } catch (error) {
      if (error instanceof MongooseError.ValidationError) {
        throw new Error(`Validation error: ${error.message}`)
      }
      if (error instanceof Error && error.message === 'Club not found') {
        throw error
      }
      throw new Error(`Failed to update club: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deleteClub(id: string): Promise<IClub | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid club ID format')
    }

    try {
      const club = await Club.findByIdAndDelete(id).exec()
      if (!club) {
        throw new Error('Club not found')
      }
      return club
    } catch (error) {
      if (error instanceof Error && error.message === 'Club not found') {
        throw error
      }
      throw new Error(`Failed to delete club: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updateFinances(id: string, income: number, expense: number): Promise<IClub | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid club ID format')
    }

    try {
      const club = await Club.findById(id).exec()
      if (!club) {
        throw new Error('Club not found')
      }

      const newCash = club.finances.cash + income - expense
      if (newCash < 0) {
        throw new Error('Insufficient funds: transaction would result in negative cash balance')
      }

      club.finances.cash = newCash
      club.finances.incomeHistory.push({
        type: 'other',
        amount: income,
        date: new Date()
      })
      club.finances.expenseHistory.push({
        type: 'other',
        amount: expense,
        date: new Date()
      })

      return await club.save()
    } catch (error) {
      if (error instanceof Error && (error.message === 'Club not found' || error.message === 'Insufficient funds: transaction would result in negative cash balance')) {
        throw error
      }
      throw new Error(`Failed to update finances: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}
