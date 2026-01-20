import { ClubService } from '../src/services/clubService'
import { Club } from '../src/models/Club'
import mongoose from 'mongoose'

jest.mock('../src/models/Club')

describe('ClubService', () => {
  let clubService: ClubService

  beforeEach(() => {
    clubService = new ClubService()
    jest.clearAllMocks()
  })

  describe('getAllClubs', () => {
    it('should return all clubs', async () => {
      const mockClubs = [
        { _id: '1', name: 'FC Barcelona', city: 'Barcelona' },
        { _id: '2', name: 'Real Madrid', city: 'Madrid' }
      ]

      Club.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockClubs)
      } as any)

      const result = await clubService.getAllClubs()

      expect(Club.find).toHaveBeenCalled()
      expect(result).toEqual(mockClubs)
    })

    it('should throw error when database fails', async () => {
      Club.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error'))
      } as any)

      await expect(clubService.getAllClubs()).rejects.toThrow('Failed to fetch clubs')
    })
  })

  describe('getClubById', () => {
    it('should return club by id', async () => {
      const mockClub = { _id: '507f1f77bcf86cd799439011', name: 'FC Barcelona', city: 'Barcelona' }

      Club.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockClub)
      } as any)

      const result = await clubService.getClubById('507f1f77bcf86cd799439011')

      expect(Club.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011')
      expect(result).toEqual(mockClub)
    })

    it('should return null for non-existent club', async () => {
      Club.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any)

      const result = await clubService.getClubById('507f1f77bcf86cd799439011')

      expect(result).toBeNull()
    })

    it('should throw error for invalid ObjectId', async () => {
      await expect(clubService.getClubById('invalid-id')).rejects.toThrow('Invalid club ID format')
    })

    it('should throw error when database fails', async () => {
      Club.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error'))
      } as any)

      await expect(clubService.getClubById('507f1f77bcf86cd799439011')).rejects.toThrow('Failed to fetch club')
    })
  })

  describe('createClub', () => {
    it('should create a new club', async () => {
      const clubData = {
        name: 'Test Club',
        foundedYear: 2000,
        city: 'Test City'
      }

      Club.create = jest.fn().mockResolvedValue({
        _id: '1',
        ...clubData
      })

      const result = await clubService.createClub(clubData)

      expect(Club.create).toHaveBeenCalledWith(clubData)
      expect(result._id).toBe('1')
    })

    it('should throw error for duplicate club name', async () => {
      const clubData = { name: 'Test Club', foundedYear: 2000, city: 'Test City' }
      const error = new Error('Duplicate key') as any
      error.code = 11000

      Club.create = jest.fn().mockRejectedValue(error)

      await expect(clubService.createClub(clubData)).rejects.toThrow('Club with this name already exists')
    })

    it('should throw error for validation error', async () => {
      const clubData = { name: '', foundedYear: 2000, city: 'Test City' }
      const error = new Error('Validation failed')

      Club.create = jest.fn().mockRejectedValue(error)

      await expect(clubService.createClub(clubData)).rejects.toThrow('Validation error')
    })
  })

  describe('updateClub', () => {
    it('should update club', async () => {
      const updatedClub = { _id: '507f1f77bcf86cd799439011', name: 'Updated FC Barcelona' }
      const updateData = { name: 'Updated FC Barcelona' }

      Club.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedClub)
      } as any)

      const result = await clubService.updateClub('507f1f77bcf86cd799439011', updateData)

      expect(Club.findByIdAndUpdate).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateData, { new: true, runValidators: true })
      expect(result).toEqual(updatedClub)
    })

    it('should throw error for invalid ObjectId', async () => {
      await expect(clubService.updateClub('invalid-id', {})).rejects.toThrow('Invalid club ID format')
    })

    it('should throw error when club not found', async () => {
      Club.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any)

      await expect(clubService.updateClub('507f1f77bcf86cd799439011', {})).rejects.toThrow('Club not found')
    })

    it('should throw error for validation error', async () => {
      const error = new Error('Validation failed')

      Club.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(error)
      } as any)

      await expect(clubService.updateClub('507f1f77bcf86cd799439011', { name: '' })).rejects.toThrow('Validation error')
    })
  })

  describe('deleteClub', () => {
    it('should delete club', async () => {
      const deletedClub = { _id: '507f1f77bcf86cd799439011', name: 'FC Barcelona' }

      Club.findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(deletedClub)
      } as any)

      const result = await clubService.deleteClub('507f1f77bcf86cd799439011')

      expect(Club.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011')
      expect(result).toEqual(deletedClub)
    })

    it('should throw error for invalid ObjectId', async () => {
      await expect(clubService.deleteClub('invalid-id')).rejects.toThrow('Invalid club ID format')
    })

    it('should throw error when club not found', async () => {
      Club.findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any)

      await expect(clubService.deleteClub('507f1f77bcf86cd799439011')).rejects.toThrow('Club not found')
    })
  })

  describe('updateFinances', () => {
    const mockClub = {
      _id: '507f1f77bcf86cd799439011',
      name: 'FC Barcelona',
      finances: {
        cash: 50000000,
        budget: 100000000,
        incomeHistory: [],
        expenseHistory: []
      }
    }

    it('should update club finances', async () => {
      const saveMock = jest.fn().mockResolvedValue(mockClub)
      Club.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockClub, save: saveMock })
      } as any)

      const result = await clubService.updateFinances('507f1f77bcf86cd799439011', 1000000, 500000)

      expect(result?.finances.cash).toBe(50500000)
      expect(saveMock).toHaveBeenCalled()
    })

    it('should throw error for insufficient funds', async () => {
      const saveMock = jest.fn().mockResolvedValue(mockClub)
      Club.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockClub, save: saveMock })
      } as any)

      await expect(clubService.updateFinances('507f1f77bcf86cd799439011', 1000000, 60000000))
        .rejects.toThrow('Insufficient funds')
    })

    it('should throw error for invalid ObjectId', async () => {
      await expect(clubService.updateFinances('invalid-id', 1000000, 500000)).rejects.toThrow('Invalid club ID format')
    })

    it('should throw error when club not found', async () => {
      Club.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any)

      await expect(clubService.updateFinances('507f1f77bcf86cd799439011', 1000000, 500000)).rejects.toThrow('Club not found')
    })

    it('should add income and expense records', async () => {
      const saveMock = jest.fn().mockResolvedValue(mockClub)
      Club.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockClub, save: saveMock })
      } as any)

      await clubService.updateFinances('507f1f77bcf86cd799439011', 1000000, 500000)

      expect(saveMock).toHaveBeenCalled()
    })
  })
})
