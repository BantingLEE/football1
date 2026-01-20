import { YouthService } from '../src/services/youthService'
import { Player } from '../src/models/Player'
import { YouthFacility } from '../src/models/YouthFacility'
import { YOUTH_FACILITY_LEVELS, PLAYER_AGE_GROUPS } from 'football-manager-shared'

jest.mock('../src/models/Player')
jest.mock('../src/models/YouthFacility')

describe('YouthService', () => {
  let youthService: YouthService

  beforeEach(() => {
    youthService = new YouthService()
    jest.clearAllMocks()
  })

  describe('calculateFacilityCapacity', () => {
    it('should return capacity for level 1', () => {
      const capacity = youthService['calculateFacilityCapacity'](1)
      expect(capacity).toBe(10)
    })

    it('should return capacity for level 3', () => {
      const capacity = youthService['calculateFacilityCapacity'](3)
      expect(capacity).toBe(20)
    })

    it('should return capacity for level 5', () => {
      const capacity = youthService['calculateFacilityCapacity'](5)
      expect(capacity).toBe(30)
    })

    it('should throw error for invalid level', () => {
      expect(() => youthService['calculateFacilityCapacity'](6)).toThrow('Invalid facility level')
    })

    it('should throw error for level less than 1', () => {
      expect(() => youthService['calculateFacilityCapacity'](0)).toThrow('Invalid facility level')
    })
  })

  describe('generateYouthPlayers', () => {
    const mockFacility = {
      clubId: 'club1',
      level: 2,
      lastGenerationDate: new Date('2026-01-01'),
      save: jest.fn().mockResolvedValue(true)
    }

    it('should generate new youth players based on facility level', async () => {
      YouthFacility.findOne = jest.fn().mockResolvedValue(mockFacility)
      Player.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([])
      } as any)

      const mockCreatedPlayer = {
        _id: 'player1',
        name: 'Youth Player',
        age: 16,
        isYouth: true,
        clubId: 'club1'
      }
      Player.create = jest.fn().mockResolvedValue(mockCreatedPlayer)

      const result = await youthService.generateYouthPlayers('club1')

      expect(YouthFacility.findOne).toHaveBeenCalledWith({ clubId: 'club1' })
      expect(Player.create).toHaveBeenCalled()
    })

    it('should not generate players if capacity is full', async () => {
      const fullCapacityPlayers = Array(15).fill({})
      YouthFacility.findOne = jest.fn().mockResolvedValue(mockFacility)
      Player.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(fullCapacityPlayers)
      } as any)

      const result = await youthService.generateYouthPlayers('club1')

      expect(Player.create).not.toHaveBeenCalled()
    })

    it('should throw error when facility not found', async () => {
      YouthFacility.findOne = jest.fn().mockResolvedValue(null)

      await expect(youthService.generateYouthPlayers('club1')).rejects.toThrow('Youth facility not found for club')
    })

    it('should throw error when clubId is missing', async () => {
      await expect(youthService.generateYouthPlayers('')).rejects.toThrow('Club ID is required')
    })
  })

  describe('upgradeFacility', () => {
    const mockFacility = {
      _id: 'facility1',
      clubId: 'club1',
      level: 2,
      upgradeHistory: [],
      save: jest.fn().mockResolvedValue(true)
    }

    it('should upgrade youth facility to next level', async () => {
      YouthFacility.findOne = jest.fn().mockResolvedValue(mockFacility)

      const result = await youthService.upgradeFacility('club1', 3)

      expect(mockFacility.level).toBe(3)
      expect(mockFacility.save).toHaveBeenCalled()
    })

    it('should not upgrade if target level is not next level', async () => {
      await expect(youthService.upgradeFacility('club1', 5)).rejects.toThrow('Can only upgrade to next level')
    })

    it('should not upgrade beyond maximum level 5', async () => {
      const maxFacility = { ...mockFacility, level: 5, save: jest.fn() }
      YouthFacility.findOne = jest.fn().mockResolvedValue(maxFacility)

      await expect(youthService.upgradeFacility('club1', 6)).rejects.toThrow('Cannot upgrade beyond level 5')
    })

    it('should throw error when facility not found', async () => {
      YouthFacility.findOne = jest.fn().mockResolvedValue(null)

      await expect(youthService.upgradeFacility('club1', 3)).rejects.toThrow('Youth facility not found for club')
    })

    it('should throw error when clubId is missing', async () => {
      await expect(youthService.upgradeFacility('', 3)).rejects.toThrow('Club ID is required')
    })

    it('should throw error when targetLevel is missing', async () => {
      await expect(youthService.upgradeFacility('club1', 0)).rejects.toThrow('Target level is required')
    })
  })

  describe('getYouthPlayers', () => {
    const mockYouthPlayers = [
      { _id: '1', name: 'Youth 1', isYouth: true, clubId: 'club1' },
      { _id: '2', name: 'Youth 2', isYouth: true, clubId: 'club1' }
    ]

    it('should return all youth players for a club', async () => {
      Player.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockYouthPlayers)
      } as any)

      const result = await youthService.getYouthPlayers('club1')

      expect(Player.find).toHaveBeenCalledWith({ clubId: 'club1', isYouth: true })
      expect(result).toHaveLength(2)
    })

    it('should throw error when clubId is missing', async () => {
      await expect(youthService.getYouthPlayers('')).rejects.toThrow('Club ID is required')
    })

    it('should throw error when database query fails', async () => {
      Player.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error'))
      } as any)

      await expect(youthService.getYouthPlayers('club1')).rejects.toThrow('Failed to fetch youth players')
    })
  })

  describe('promoteToFirstTeam', () => {
    const mockYouthPlayer = {
      _id: 'player1',
      name: 'Youth Player',
      isYouth: true,
      age: 18,
      save: jest.fn().mockResolvedValue(true)
    }

    it('should promote youth player to first team', async () => {
      Player.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockYouthPlayer)
      } as any)

      const result = await youthService.promoteToFirstTeam('player1')

      expect(result?.isYouth).toBe(false)
      expect(mockYouthPlayer.save).toHaveBeenCalled()
    })

    it('should throw error when player not found', async () => {
      Player.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any)

      await expect(youthService.promoteToFirstTeam('player1')).rejects.toThrow('Player not found')
    })

    it('should throw error when player is not a youth player', async () => {
      const seniorPlayer = { ...mockYouthPlayer, isYouth: false, save: jest.fn() }
      Player.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(seniorPlayer)
      } as any)

      await expect(youthService.promoteToFirstTeam('player1')).rejects.toThrow('Player is not a youth player')
    })

    it('should throw error when playerId is missing', async () => {
      await expect(youthService.promoteToFirstTeam('')).rejects.toThrow('Player ID is required')
    })
  })

  describe('trainYouthPlayer', () => {
    const mockYouthPlayer = {
      _id: 'player1',
      name: 'Youth Player',
      isYouth: true,
      age: 16,
      attributes: {
        speed: 60,
        shooting: 55,
        passing: 58,
        defending: 50,
        physical: 55,
        technical: 52,
        mental: 54
      },
      currentAbility: 56,
      history: {
        matchesPlayed: 0,
        goals: 0,
        assists: 0,
        growthLog: []
      },
      save: jest.fn().mockResolvedValue(true)
    }

    it('should train youth player with technical training', async () => {
      Player.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockYouthPlayer)
      } as any)

      const result = await youthService.trainYouthPlayer('player1', 'technical', 7)

      expect(Player.findById).toHaveBeenCalledWith('player1')
      expect(mockYouthPlayer.save).toHaveBeenCalled()
    })

    it('should throw error when player not found', async () => {
      Player.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any)

      await expect(youthService.trainYouthPlayer('player1', 'technical', 7)).rejects.toThrow('Player not found')
    })

    it('should throw error when player is not a youth player', async () => {
      const seniorPlayer = { ...mockYouthPlayer, isYouth: false }
      Player.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(seniorPlayer)
      } as any)

      await expect(youthService.trainYouthPlayer('player1', 'technical', 7)).rejects.toThrow('Player is not a youth player')
    })

    it('should throw error for invalid training type', async () => {
      await expect(youthService.trainYouthPlayer('player1', 'invalid', 7)).rejects.toThrow('Invalid training type')
    })

    it('should throw error when playerId is missing', async () => {
      await expect(youthService.trainYouthPlayer('', 'technical', 7)).rejects.toThrow('Player ID is required')
    })

    it('should throw error when trainingType is missing', async () => {
      await expect(youthService.trainYouthPlayer('player1', '', 7)).rejects.toThrow('Training type is required')
    })
  })

  describe('retireOldPlayers', () => {
    const oldPlayers = [
      { _id: '1', name: 'Old Player 1', age: 36, clubId: 'club1', isYouth: false },
      { _id: '2', name: 'Old Player 2', age: 38, clubId: 'club1', isYouth: false },
      { _id: '3', name: 'Old Player 3', age: 40, clubId: 'club1', isYouth: false }
    ]

    it('should retire players above retirement age', async () => {
      Player.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(oldPlayers)
      } as any)
      Player.findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(oldPlayers[0])
      } as any)

      const result = await youthService.retireOldPlayers()

      expect(Player.find).toHaveBeenCalledWith({
        age: { $gte: PLAYER_AGE_GROUPS.RETIREMENT.min },
        isYouth: false
      })
      expect(result).toBeDefined()
    })

    it('should not retire youth players', async () => {
      const mixedAgePlayers = [
        ...oldPlayers,
        { _id: '4', name: 'Youth', age: 36, clubId: 'club1', isYouth: true }
      ]
      Player.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(oldPlayers)
      } as any)
      Player.findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(oldPlayers[0])
      } as any)

      await youthService.retireOldPlayers()

      expect(Player.findByIdAndDelete).toHaveBeenCalledTimes(3)
    })

    it('should throw error when database operation fails', async () => {
      Player.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error'))
      } as any)

      await expect(youthService.retireOldPlayers()).rejects.toThrow('Failed to retire players')
    })
  })
})
