import { PlayerService } from '../src/services/playerService'
import { Player } from '../src/models/Player'

jest.mock('../src/models/Player')

describe('PlayerService', () => {
  let playerService: PlayerService

  beforeEach(() => {
    playerService = new PlayerService()
  })

  describe('createPlayer', () => {
    it('should create a new player with default attributes', async () => {
      const playerData = {
        name: 'Lionel Messi',
        age: 25,
        position: 'RW',
        clubId: '1'
      }

      Player.create = jest.fn().mockResolvedValue({
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
        currentAbility: 92
      })

      const result = await playerService.createPlayer(playerData)

      expect(Player.create).toHaveBeenCalled()
      expect(result.attributes.speed).toBeGreaterThan(0)
    })
  })

  describe('getPlayersByClub', () => {
    it('should return all players for a given club', async () => {
      Player.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          { _id: '1', name: 'Player 1', clubId: 'club1' },
          { _id: '2', name: 'Player 2', clubId: 'club1' }
        ])
      } as any)

      const result = await playerService.getPlayersByClub('club1')

      expect(Player.find).toHaveBeenCalledWith({ clubId: 'club1' })
      expect(result).toHaveLength(2)
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
  })
})