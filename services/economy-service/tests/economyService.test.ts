import { EconomyService } from '../src/services/economyService'
import { Transfer } from '../src/models/Transfer'
import { FinancialRecord } from '../src/models/FinancialRecord'
import mongoose from 'mongoose'

jest.mock('../src/models/Transfer')
jest.mock('../src/models/FinancialRecord')

describe('EconomyService', () => {
  let economyService: EconomyService

  beforeEach(() => {
    economyService = new EconomyService()
    jest.clearAllMocks()
  })

  describe('calculateWeeklyIncome', () => {
    it('should calculate weekly income from all sources', async () => {
      const mockRecords = [
        { type: 'ticket', amount: 500000 },
        { type: 'broadcast', amount: 300000 },
        { type: 'sponsorship', amount: 200000 },
        { type: 'merchandise', amount: 100000 }
      ]

      FinancialRecord.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRecords)
      } as any)

      const result = await economyService.calculateWeeklyIncome('507f1f77bcf86cd799439011')

      expect(result.totalIncome).toBe(1100000)
      expect(result.ticket).toBe(500000)
      expect(result.broadcast).toBe(300000)
      expect(result.sponsorship).toBe(200000)
      expect(result.merchandise).toBe(100000)
    })

    it('should return zero income when no records found', async () => {
      FinancialRecord.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([])
      } as any)

      const result = await economyService.calculateWeeklyIncome('507f1f77bcf86cd799439011')

      expect(result.totalIncome).toBe(0)
      expect(result.ticket).toBe(0)
      expect(result.broadcast).toBe(0)
      expect(result.sponsorship).toBe(0)
      expect(result.merchandise).toBe(0)
    })

    it('should throw error for invalid club ID', async () => {
      await expect(economyService.calculateWeeklyIncome('invalid-id')).rejects.toThrow('Invalid club ID format')
    })

    it('should throw error when database query fails', async () => {
      FinancialRecord.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error'))
      } as any)

      await expect(economyService.calculateWeeklyIncome('507f1f77bcf86cd799439011')).rejects.toThrow('Failed to calculate income')
    })
  })

  describe('calculateWeeklyExpenses', () => {
    it('should calculate weekly expenses from all sources', async () => {
      const mockRecords = [
        { type: 'wages', amount: 800000 },
        { type: 'operations', amount: 150000 }
      ]

      FinancialRecord.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRecords)
      } as any)

      const result = await economyService.calculateWeeklyExpenses('507f1f77bcf86cd799439011')

      expect(result.totalExpenses).toBe(950000)
      expect(result.wages).toBe(800000)
      expect(result.operations).toBe(150000)
    })

    it('should return zero expenses when no records found', async () => {
      FinancialRecord.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([])
      } as any)

      const result = await economyService.calculateWeeklyExpenses('507f1f77bcf86cd799439011')

      expect(result.totalExpenses).toBe(0)
      expect(result.wages).toBe(0)
      expect(result.operations).toBe(0)
    })

    it('should throw error for invalid club ID', async () => {
      await expect(economyService.calculateWeeklyExpenses('invalid-id')).rejects.toThrow('Invalid club ID format')
    })

    it('should throw error when database query fails', async () => {
      FinancialRecord.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error'))
      } as any)

      await expect(economyService.calculateWeeklyExpenses('507f1f77bcf86cd799439011')).rejects.toThrow('Failed to calculate expenses')
    })
  })

  describe('processTransfer', () => {
    const transferData = {
      playerId: 'player123',
      fromClubId: 'club1',
      toClubId: 'club2',
      transferFee: 50000000,
      type: 'permanent' as const
    }

    it('should process a successful transfer', async () => {
      const mockTransfer = {
        _id: 'transfer1',
        ...transferData,
        status: 'completed',
        save: jest.fn().mockResolvedValue(true)
      }

      Transfer.create = jest.fn().mockResolvedValue(mockTransfer)

      const result = await economyService.processTransfer(transferData)

      expect(Transfer.create).toHaveBeenCalled()
      expect(result.status).toBe('completed')
    })

    it('should throw error for invalid transfer fee', async () => {
      await expect(economyService.processTransfer({ ...transferData, transferFee: -1000, type: 'permanent' as const })).rejects.toThrow('Transfer fee must be positive')
    })

    it('should throw error when same club', async () => {
      await expect(economyService.processTransfer({ ...transferData, fromClubId: 'club1', toClubId: 'club1', type: 'permanent' as const })).rejects.toThrow('Cannot transfer within the same club')
    })

    it('should throw error when database operation fails', async () => {
      Transfer.create = jest.fn().mockRejectedValue(new Error('Database error'))

      await expect(economyService.processTransfer(transferData)).rejects.toThrow('Failed to process transfer')
    })
  })

  describe('getTransferList', () => {
    it('should return filtered transfer list', async () => {
      const mockTransfers = [
        { _id: '1', type: 'permanent', transferFee: 50000000, status: 'active' },
        { _id: '2', type: 'loan', transferFee: 0, status: 'active' }
      ]

      Transfer.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockTransfers)
        })
      } as any)

      const result = await economyService.getTransferList({ type: 'permanent' })

      expect(result).toHaveLength(2)
    })

    it('should return all transfers when no filters provided', async () => {
      const mockTransfers = [
        { _id: '1', type: 'permanent', status: 'active' },
        { _id: '2', type: 'loan', status: 'active' }
      ]

      Transfer.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockTransfers)
        })
      } as any)

      const result = await economyService.getTransferList({})

      expect(result).toHaveLength(2)
    })

    it('should throw error when database query fails', async () => {
      Transfer.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      } as any)

      await expect(economyService.getTransferList({})).rejects.toThrow('Failed to get transfer list')
    })
  })

  describe('updateBudget', () => {
    const mockClub = {
      _id: '507f1f77bcf86cd799439011',
      finances: {
        budget: 100000000,
        cash: 50000000,
        incomeHistory: [],
        expenseHistory: []
      },
      save: jest.fn().mockResolvedValue(true)
    }

    it('should update club budget with income', async () => {
      const updatedClub = {
        ...mockClub,
        finances: {
          budget: 100000000,
          cash: 51000000,
          incomeHistory: [],
          expenseHistory: []
        }
      }

      const mongooseModel = require('mongoose')
      mongooseModel.model = jest.fn().mockReturnValue({
        findById: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockClub)
        })
      })

      const result = await economyService.updateBudget('507f1f77bcf86cd799439011', 1000000, 0)

      expect(mockClub.save).toHaveBeenCalled()
    })

    it('should throw error for insufficient funds', async () => {
      mockClub.finances.cash = 50000

      const mongooseModel = require('mongoose')
      mongooseModel.model = jest.fn().mockReturnValue({
        findById: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockClub)
        })
      })

      await expect(economyService.updateBudget('507f1f77bcf86cd799439011', 0, 1000000)).rejects.toThrow('Insufficient funds')
    })

    it('should throw error for invalid club ID', async () => {
      await expect(economyService.updateBudget('invalid-id', 1000, 0)).rejects.toThrow('Invalid club ID format')
    })

    it('should throw error when club not found', async () => {
      const mongooseModel = require('mongoose')
      mongooseModel.model = jest.fn().mockReturnValue({
        findById: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      })

      await expect(economyService.updateBudget('507f1f77bcf86cd799439011', 1000, 0)).rejects.toThrow('Club not found')
    })
  })

  describe('getFinancialReport', () => {
    it('should generate financial report for a period', async () => {
      const mockRecords = [
        { type: 'ticket', amount: 500000, date: new Date(), recordType: 'income' },
        { type: 'wages', amount: 300000, date: new Date(), recordType: 'expense' }
      ]

      FinancialRecord.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRecords)
      } as any)

      const result = await economyService.getFinancialReport('507f1f77bcf86cd799439011', 'weekly')

      expect(result.totalIncome).toBe(500000)
      expect(result.totalExpenses).toBe(300000)
      expect(result.netProfit).toBe(200000)
      expect(result.period).toBe('weekly')
    })

    it('should throw error for invalid club ID', async () => {
      await expect(economyService.getFinancialReport('invalid-id', 'weekly')).rejects.toThrow('Invalid club ID format')
    })

    it('should throw error when database query fails', async () => {
      FinancialRecord.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error'))
      } as any)

      await expect(economyService.getFinancialReport('507f1f77bcf86cd799439011', 'weekly')).rejects.toThrow('Failed to generate financial report')
    })
  })
})
