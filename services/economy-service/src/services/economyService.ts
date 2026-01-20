import { Transfer, ITransfer } from '../models/Transfer'
import { FinancialRecord, IFinancialRecord } from '../models/FinancialRecord'
import { Club, IClub } from '../../club-service/src/models/Club'
import mongoose from 'mongoose'
import { Error as MongooseError } from 'mongoose'

export interface IncomeBreakdown {
  ticket: number
  broadcast: number
  sponsorship: number
  merchandise: number
  totalIncome: number
}

export interface ExpenseBreakdown {
  wages: number
  operations: number
  totalExpenses: number
}

export interface FinancialReport {
  period: string
  startDate: Date
  endDate: Date
  totalIncome: number
  totalExpenses: number
  netProfit: number
  incomeBreakdown: {
    ticket: number
    broadcast: number
    sponsorship: number
    merchandise: number
    other: number
  }
  expenseBreakdown: {
    wages: number
    transfer: number
    operations: number
    penalty: number
    other: number
  }
}

export class EconomyService {
  async calculateWeeklyIncome(clubId: string): Promise<IncomeBreakdown> {
    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      throw new Error('Invalid club ID format')
    }

    try {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      const records = await FinancialRecord.find({
        clubId,
        recordType: 'income',
        date: { $gte: oneWeekAgo }
      }).exec()

      const breakdown = records.reduce((acc, record) => {
        if (record.type in acc) {
          acc[record.type as keyof typeof acc] += record.amount
        }
        return acc
      }, { ticket: 0, broadcast: 0, sponsorship: 0, merchandise: 0 })

      const totalIncome = Object.values(breakdown).reduce((sum, val) => sum + val, 0)

      return {
        ...breakdown,
        totalIncome
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid club ID format') {
        throw error
      }
      throw new Error(`Failed to calculate income: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async calculateWeeklyExpenses(clubId: string): Promise<ExpenseBreakdown> {
    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      throw new Error('Invalid club ID format')
    }

    try {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      const records = await FinancialRecord.find({
        clubId,
        recordType: 'expense',
        date: { $gte: oneWeekAgo }
      }).exec()

      const breakdown = records.reduce((acc, record) => {
        if (record.type in acc) {
          acc[record.type as keyof typeof acc] += record.amount
        }
        return acc
      }, { wages: 0, operations: 0 })

      const totalExpenses = Object.values(breakdown).reduce((sum, val) => sum + val, 0)

      return {
        ...breakdown,
        totalExpenses
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid club ID format') {
        throw error
      }
      throw new Error(`Failed to calculate expenses: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async processTransfer(transferData: {
    playerId: string
    fromClubId: string
    toClubId: string
    transferFee: number
    type: 'permanent' | 'loan' | 'free'
    contractLength?: number
  }): Promise<ITransfer> {
    if (!mongoose.Types.ObjectId.isValid(transferData.playerId)) {
      throw new Error('Invalid player ID format')
    }
    if (!mongoose.Types.ObjectId.isValid(transferData.fromClubId)) {
      throw new Error('Invalid from club ID format')
    }
    if (!mongoose.Types.ObjectId.isValid(transferData.toClubId)) {
      throw new Error('Invalid to club ID format')
    }
    if (transferData.transferFee < 0) {
      throw new Error('Transfer fee must be positive')
    }

    if (transferData.fromClubId === transferData.toClubId) {
      throw new Error('Cannot transfer within the same club')
    }

    try {
      const transfer = await Transfer.create({
        ...transferData,
        status: 'completed'
      })

      const incomeRecord = new FinancialRecord({
        clubId: transferData.fromClubId,
        recordType: 'income',
        type: 'transfer',
        amount: transferData.transferFee,
        description: `Transfer fee received for player ${transferData.playerId}`,
        transferId: transfer._id
      })

      const expenseRecord = new FinancialRecord({
        clubId: transferData.toClubId,
        recordType: 'expense',
        type: 'transfer',
        amount: transferData.transferFee,
        description: `Transfer fee paid for player ${transferData.playerId}`,
        transferId: transfer._id
      })

      await Promise.all([incomeRecord.save(), expenseRecord.save()])

      return transfer
    } catch (error) {
      if (error instanceof Error && (error.message === 'Invalid player ID format' || error.message === 'Invalid from club ID format' || error.message === 'Invalid to club ID format' || error.message === 'Transfer fee must be positive' || error.message === 'Cannot transfer within the same club')) {
        throw error
      }
      if (error instanceof MongooseError.ValidationError) {
        throw new Error(`Validation error: ${error.message}`)
      }
      throw new Error(`Failed to process transfer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getTransferList(filters: {
    type?: string
    status?: string
    fromClubId?: string
    toClubId?: string
  }): Promise<ITransfer[]> {
    try {
      const query: {
        type?: string
        status?: string
        fromClubId?: string
        toClubId?: string
      } = {}

      if (filters.type) {
        query.type = filters.type
      }
      if (filters.status) {
        query.status = filters.status
      }
      if (filters.fromClubId) {
        query.fromClubId = filters.fromClubId
      }
      if (filters.toClubId) {
        query.toClubId = filters.toClubId
      }

      const transfers = await Transfer.find(query).sort({ createdAt: -1 }).exec()
      return transfers
    } catch (error) {
      throw new Error(`Failed to get transfer list: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updateBudget(clubId: string, income: number, expense: number): Promise<IClub> {
    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      throw new Error('Invalid club ID format')
    }

    if (income < 0 || expense < 0) {
      throw new Error('Income and expense must be non-negative')
    }

    try {
      const club: IClub | null = await Club.findById(clubId).exec()

      if (!club) {
        throw new Error('Club not found')
      }

      const newCash = club.finances.cash + income - expense
      if (newCash < 0) {
        throw new Error('Insufficient funds: transaction would result in negative cash balance')
      }

      club.finances.cash = newCash

      if (income > 0) {
        club.finances.incomeHistory.push({
          type: 'other',
          amount: income,
          date: new Date()
        })
      }

      if (expense > 0) {
        club.finances.expenseHistory.push({
          type: 'other',
          amount: expense,
          date: new Date()
        })
      }

      await club.save()
      return club
    } catch (error) {
      if (error instanceof Error && (error.message === 'Invalid club ID format' || error.message === 'Insufficient funds' || error.message === 'Club not found')) {
        throw error
      }
      throw new Error(`Failed to update budget: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getFinancialReport(clubId: string, period: 'weekly' | 'monthly' | 'yearly'): Promise<FinancialReport> {
    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      throw new Error('Invalid club ID format')
    }

    if (!['weekly', 'monthly', 'yearly'].includes(period)) {
      throw new Error('Invalid period. Must be weekly, monthly, or yearly')
    }

    try {
      const endDate = new Date()
      const startDate = new Date()

      if (period === 'weekly') {
        startDate.setDate(startDate.getDate() - 7)
      } else if (period === 'monthly') {
        startDate.setMonth(startDate.getMonth() - 1)
      } else if (period === 'yearly') {
        startDate.setFullYear(startDate.getFullYear() - 1)
      }

      const records = await FinancialRecord.find({
        clubId,
        date: { $gte: startDate, $lte: endDate }
      }).exec()

      const incomeBreakdown = records
        .filter(r => r.recordType === 'income')
        .reduce((acc, record) => {
          const type = record.type as keyof typeof acc
          if (!acc[type]) acc[type] = 0
          acc[type] += record.amount
          return acc
        }, { ticket: 0, broadcast: 0, sponsorship: 0, merchandise: 0, other: 0 })

      const expenseBreakdown = records
        .filter(r => r.recordType === 'expense')
        .reduce((acc, record) => {
          const type = record.type as keyof typeof acc
          if (!acc[type]) acc[type] = 0
          acc[type] += record.amount
          return acc
        }, { wages: 0, transfer: 0, operations: 0, penalty: 0, other: 0 })

      const totalIncome = Object.values(incomeBreakdown).reduce((sum, val) => sum + val, 0)
      const totalExpenses = Object.values(expenseBreakdown).reduce((sum, val) => sum + val, 0)

      return {
        period,
        startDate,
        endDate,
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        incomeBreakdown,
        expenseBreakdown
      }
    } catch (error) {
      if (error instanceof Error && (error.message === 'Invalid club ID format' || error.message.includes('Invalid period'))) {
        throw error
      }
      throw new Error(`Failed to generate financial report: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}
