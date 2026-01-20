import { Club, IClub } from '../models/Club'

export class ClubService {
  async getAllClubs(): Promise<IClub[]> {
    const clubs = await Club.find().exec()
    return clubs
  }

  async getClubById(id: string): Promise<IClub | null> {
    const club = await Club.findById(id).exec()
    return club
  }

  async createClub(clubData: Partial<IClub>): Promise<IClub> {
    const club = await Club.create(clubData)
    return club
  }

  async updateClub(id: string, clubData: Partial<IClub>): Promise<IClub | null> {
    const club = await Club.findByIdAndUpdate(id, clubData, { new: true }).exec()
    return club
  }

  async deleteClub(id: string): Promise<IClub | null> {
    const club = await Club.findByIdAndDelete(id).exec()
    return club
  }

  async updateFinances(id: string, income: number, expense: number): Promise<IClub | null> {
    const club = await Club.findById(id).exec()
    if (!club) return null

    club.finances.cash += income - expense
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
  }
}
