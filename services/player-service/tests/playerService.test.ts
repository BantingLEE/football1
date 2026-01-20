import { PlayerService } from '../src/services/playerService'
import { Player } from '../src/models/Player'

jest.mock('../src/models/Player')

describe('PlayerService', () => {
  let playerService: PlayerService

  beforeEach(() => {
    playerService = new PlayerService()
    jest.clearAllMocks()
  })

  describe('getAllPlayers', () => {
    it('should return all players', async () => {
      const mockPlayers = [
        { _id: '1', name: 'Player 1' },
        { _id: '2', name: 'Player 2' }
      ]
      Player.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlayers)
      } as any)

      const result = await playerService.getAllPlayers()

      expect(Player.find).toHaveBeenCalled()
      expect(result).toEqual(mockPlayers)
    })

    it('should throw error when database query fails', async () => {
      Player.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error'))
      } as any)

      await expect(playerService.getAllPlayers()).rejects.toThrow('Failed to fetch players')
    })
  })

  describe('getPlayerById', () => {
    it('should return player by id', async () => {
      const mockPlayer = { _id: '1', name: 'Player 1' }
      Player.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlayer)
      } as any)

      const result = await playerService.getPlayerById('1')

      expect(Player.findById).toHaveBeenCalledWith('1')
      expect(result).toEqual(mockPlayer)
    })

    it('should return null when player not found', async () => {
      Player.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any)

      const result = await playerService.getPlayerById('999')

      expect(result).toBeNull()
    })

    it('should throw error when id is missing', async () => {
      await expect(playerService.getPlayerById('')).rejects.toThrow('Player ID is required')
    })

    it('should throw error when database query fails', async () => {
      Player.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error'))
      } as any)

      await expect(playerService.getPlayerById('1')).rejects.toThrow('Failed to fetch player')
    })
  })

  describe('getPlayersByClub', () => {
    it('should return all players for a given club', async () => {
      const mockPlayers = [
        { _id: '1', name: 'Player 1', clubId: 'club1' },
        { _id: '2', name: 'Player 2', clubId: 'club1' }
      ]
      Player.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlayers)
      } as any)

      const result = await playerService.getPlayersByClub('club1')

      expect(Player.find).toHaveBeenCalledWith({ clubId: 'club1' })
      expect(result).toHaveLength(2)
    })

    it('should throw error when clubId is missing', async () => {
      await expect(playerService.getPlayersByClub('')).rejects.toThrow('Club ID is required')
    })

    it('should throw error when database query fails', async () => {
      Player.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error'))
      } as any)

      await expect(playerService.getPlayersByClub('club1')).rejects.toThrow('Failed to fetch players')
    })
  })

  describe('createPlayer', () => {
    it('should create a new player with default attributes', async () => {
      const playerData = {
        name: 'Lionel Messi',
        age: 25,
        position: 'RW',
        clubId: '1'
      }

      const mockCreatedPlayer = {
        _id: '1',
        ...playerData,
        attributes: {
          speed: 85,
          shooting: 90,
          passing: 92,
          defending: 30,
          physical: 65,
          technical: 95,
          mental: 88
        },
        potential: 98,
        currentAbility: 92,
        history: {
          matchesPlayed: 0,
          goals: 0,
          assists: 0,
          growthLog: []
        }
      }

      Player.create = jest.fn().mockResolvedValue(mockCreatedPlayer)

      const result = await playerService.createPlayer(playerData)

      expect(Player.create).toHaveBeenCalled()
      expect(result.attributes.speed).toBeGreaterThan(0)
    })

    it('should throw error when required fields are missing', async () => {
      const playerData = { name: 'Test' }

      await expect(playerService.createPlayer(playerData as any)).rejects.toThrow('Name, age, and position are required')
    })

    it('should throw error when database creation fails', async () => {
      const playerData = {
        name: 'Lionel Messi',
        age: 25,
        position: 'RW'
      }

      Player.create = jest.fn().mockRejectedValue(new Error('Database error'))

      await expect(playerService.createPlayer(playerData as any)).rejects.toThrow('Failed to create player')
    })
  })

  describe('updatePlayer', () => {
    it('should update a player', async () => {
      const mockUpdatedPlayer = { _id: '1', name: 'Updated Player', age: 26 }
      Player.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUpdatedPlayer)
      } as any)

      const result = await playerService.updatePlayer('1', { name: 'Updated Player' })

      expect(Player.findByIdAndUpdate).toHaveBeenCalledWith('1', { name: 'Updated Player' }, { new: true })
      expect(result).toEqual(mockUpdatedPlayer)
    })

    it('should return null when player not found', async () => {
      Player.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any)

      const result = await playerService.updatePlayer('999', { name: 'Updated Player' })

      expect(result).toBeNull()
    })

    it('should throw error when id is missing', async () => {
      await expect(playerService.updatePlayer('', { name: 'Updated Player' } as any)).rejects.toThrow('Player ID is required')
    })

    it('should throw error when database update fails', async () => {
      Player.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error'))
      } as any)

      await expect(playerService.updatePlayer('1', { name: 'Updated Player' } as any)).rejects.toThrow('Failed to update player')
    })
  })

  describe('deletePlayer', () => {
    it('should delete a player', async () => {
      const mockDeletedPlayer = { _id: '1', name: 'Player 1' }
      Player.findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDeletedPlayer)
      } as any)

      const result = await playerService.deletePlayer('1')

      expect(Player.findByIdAndDelete).toHaveBeenCalledWith('1')
      expect(result).toEqual(mockDeletedPlayer)
    })

    it('should return null when player not found', async () => {
      Player.findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any)

      const result = await playerService.deletePlayer('999')

      expect(result).toBeNull()
    })

    it('should throw error when id is missing', async () => {
      await expect(playerService.deletePlayer('')).rejects.toThrow('Player ID is required')
    })

    it('should throw error when database delete fails', async () => {
      Player.findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error'))
      } as any)

      await expect(playerService.deletePlayer('1')).rejects.toThrow('Failed to delete player')
    })
  })

  describe('transferPlayer', () => {
    const mockPlayer = {
      _id: '1',
      name: 'Player 1',
      clubId: 'club1',
      save: jest.fn().mockResolvedValue(true)
    }

    it('should transfer a player to a new club', async () => {
      Player.findById = jest.fn().mockReturnValue({
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPlayer)
      } as any)

      const result = await playerService.transferPlayer('1', 'club1', 'club2')

      expect(Player.findById).toHaveBeenCalledWith('1')
      expect(result?.clubId).toBe('club2')
    })

    it('should throw error when player not found', async () => {
      Player.findById = jest.fn().mockReturnValue({
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null)
      } as any)

      await expect(playerService.transferPlayer('999', 'club1', 'club2')).rejects.toThrow('Player not found')
    })

    it('should throw error when fromClubId does not match', async () => {
      const mockPlayerWrongClub = {
        _id: '1',
        name: 'Player 1',
        clubId: 'club3',
        save: jest.fn()
      }
      Player.findById = jest.fn().mockReturnValue({
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPlayerWrongClub)
      } as any)

      await expect(playerService.transferPlayer('1', 'club1', 'club2')).rejects.toThrow('Player does not belong to the specified fromClubId')
    })

    it('should throw error when fromClubId equals toClubId', async () => {
      await expect(playerService.transferPlayer('1', 'club1', 'club1')).rejects.toThrow('Cannot transfer player to the same club')
    })

    it('should throw error when required params are missing', async () => {
      await expect(playerService.transferPlayer('', 'club1', 'club2')).rejects.toThrow('Player ID, fromClubId, and toClubId are required')
      await expect(playerService.transferPlayer('1', '', 'club2')).rejects.toThrow('Player ID, fromClubId, and toClubId are required')
      await expect(playerService.transferPlayer('1', 'club1', '')).rejects.toThrow('Player ID, fromClubId, and toClubId are required')
    })

    it('should throw error when database operation fails', async () => {
      Player.findById = jest.fn().mockReturnValue({
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('Database error'))
      } as any)

      await expect(playerService.transferPlayer('1', 'club1', 'club2')).rejects.toThrow('Failed to transfer player')
    })
  })

  describe('trainPlayer', () => {
    const mockPlayer = {
      _id: '1',
      name: 'Player 1',
      age: 20,
      attributes: {
        speed: 75,
        shooting: 70,
        passing: 72,
        defending: 65,
        physical: 70,
        technical: 68,
        mental: 70
      },
      currentAbility: 70,
      injury: { isInjured: false },
      history: { matchesPlayed: 0, goals: 0, assists: 0, growthLog: [] },
      save: jest.fn().mockResolvedValue(true)
    }

    it('should train a player with technical training', async () => {
      Player.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlayer)
      } as any)

      const result = await playerService.trainPlayer('1', 'technical')

      expect(Player.findById).toHaveBeenCalledWith('1')
      expect(result).toBeDefined()
      expect(mockPlayer.save).toHaveBeenCalled()
    })

    it('should throw error when player not found', async () => {
      Player.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any)

      await expect(playerService.trainPlayer('999', 'technical')).rejects.toThrow('Player not found')
    })

    it('should throw error when trainingType is invalid', async () => {
      await expect(playerService.trainPlayer('1', 'invalid')).rejects.toThrow('Invalid training type')
    })

    it('should throw error when playerId is missing', async () => {
      await expect(playerService.trainPlayer('', 'technical')).rejects.toThrow('Player ID is required')
    })

    it('should throw error when trainingType is missing', async () => {
      await expect(playerService.trainPlayer('1', '')).rejects.toThrow('Training type is required')
    })

    it('should throw error when database operation fails', async () => {
      Player.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error'))
      } as any)

      await expect(playerService.trainPlayer('1', 'technical')).rejects.toThrow('Failed to train player')
    })
  })

  describe('calculatePlayerValue', () => {
    it('should calculate player value based on age, potential, and ability', () => {
      const player = {
        age: 24,
        potential: 95,
        currentAbility: 88
      }

      const value = playerService.calculatePlayerValue(player as any)

      expect(value).toBeGreaterThan(0)
      expect(value).toBeLessThan(100000000)
    })

    it('should apply age factor for young players', () => {
      const youngPlayer = {
        age: 20,
        potential: 95,
        currentAbility: 80
      }
      const oldPlayer = {
        age: 32,
        potential: 95,
        currentAbility: 80
      }

      const youngValue = playerService.calculatePlayerValue(youngPlayer as any)
      const oldValue = playerService.calculatePlayerValue(oldPlayer as any)

      expect(youngValue).toBeGreaterThan(oldValue)
    })
  })
})