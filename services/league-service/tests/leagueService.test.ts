import { LeagueService } from '../src/services/leagueService'
import { League } from '../src/models/League'

jest.mock('../src/models/League')

describe('LeagueService', () => {
  let leagueService: LeagueService

  beforeEach(() => {
    leagueService = new LeagueService()
    jest.clearAllMocks()
  })

  describe('getLeagues', () => {
    it('should return all leagues', async () => {
      const mockLeagues = [
        { _id: '1', name: 'Premier League', country: 'England' },
        { _id: '2', name: 'La Liga', country: 'Spain' }
      ]
      League.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeagues)
      } as any)

      const result = await leagueService.getLeagues()

      expect(League.find).toHaveBeenCalled()
      expect(result).toEqual(mockLeagues)
    })

    it('should throw error when database query fails', async () => {
      League.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error'))
      } as any)

      await expect(leagueService.getLeagues()).rejects.toThrow('Failed to fetch leagues')
    })
  })

  describe('createLeague', () => {
    const leagueData = {
      name: 'Test League',
      country: 'Test Country',
      season: {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31')
      },
      clubs: ['club1', 'club2', 'club3'],
      rules: {
        promotionSlots: 1,
        relegationSlots: 1,
        points: {
          win: 3,
          draw: 1,
          loss: 0
        }
      }
    }

    it('should create a new league', async () => {
      const mockLeague = {
        _id: '1',
        ...leagueData,
        rules: {
          promotionSlots: 1,
          relegationSlots: 1,
          points: {
            win: 3,
            draw: 1,
            loss: 0
          }
        },
        standings: [
          { clubId: 'club1', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
          { clubId: 'club2', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
          { clubId: 'club3', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
        ],
        schedule: [],
        history: [],
        isActive: true
      }
      League.create = jest.fn().mockResolvedValue(mockLeague)

      const result = await leagueService.createLeague(leagueData)

      expect(League.create).toHaveBeenCalled()
      expect(result.name).toBe('Test League')
      expect(result.standings).toHaveLength(3)
    })

    it('should throw error when required fields are missing', async () => {
      const invalidData = { name: 'Test' }
      League.create = jest.fn().mockRejectedValue(new Error('Validation error'))

      await expect(leagueService.createLeague(invalidData as any)).rejects.toThrow('Failed to create league')
    })

    it('should throw error when clubs array is empty', async () => {
      await expect(leagueService.createLeague({ ...leagueData, clubs: [] } as any)).rejects.toThrow('At least two clubs are required')
    })

    it('should throw error when season start date is after end date', async () => {
      const invalidSeasonData = {
        ...leagueData,
        season: {
          start: new Date('2024-12-31'),
          end: new Date('2024-01-01')
        }
      }
      await expect(leagueService.createLeague(invalidSeasonData)).rejects.toThrow('Season start date must be before end date')
    })

    it('should throw error when season start date equals end date', async () => {
      const invalidSeasonData = {
        ...leagueData,
        season: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-01')
        }
      }
      await expect(leagueService.createLeague(invalidSeasonData)).rejects.toThrow('Season start date must be before end date')
    })

    it('should throw error when promotion slots are negative', async () => {
      const invalidRulesData = {
        ...leagueData,
        rules: {
          promotionSlots: -1,
          relegationSlots: 3,
          points: { win: 3, draw: 1, loss: 0 }
        }
      }
      await expect(leagueService.createLeague(invalidRulesData)).rejects.toThrow('Promotion slots cannot be negative')
    })

    it('should throw error when relegation slots are negative', async () => {
      const invalidRulesData = {
        ...leagueData,
        rules: {
          promotionSlots: 3,
          relegationSlots: -1,
          points: { win: 3, draw: 1, loss: 0 }
        }
      }
      await expect(leagueService.createLeague(invalidRulesData)).rejects.toThrow('Relegation slots cannot be negative')
    })

    it('should throw error when win points are negative', async () => {
      const invalidRulesData = {
        ...leagueData,
        rules: {
          promotionSlots: 3,
          relegationSlots: 3,
          points: { win: -1, draw: 1, loss: 0 }
        }
      }
      await expect(leagueService.createLeague(invalidRulesData)).rejects.toThrow('Win points cannot be negative')
    })

    it('should throw error when draw points are negative', async () => {
      const invalidRulesData = {
        ...leagueData,
        rules: {
          promotionSlots: 3,
          relegationSlots: 3,
          points: { win: 3, draw: -1, loss: 0 }
        }
      }
      await expect(leagueService.createLeague(invalidRulesData)).rejects.toThrow('Draw points cannot be negative')
    })

    it('should throw error when loss points are negative', async () => {
      const invalidRulesData = {
        ...leagueData,
        rules: {
          promotionSlots: 3,
          relegationSlots: 3,
          points: { win: 3, draw: 1, loss: -1 }
        }
      }
      await expect(leagueService.createLeague(invalidRulesData)).rejects.toThrow('Loss points cannot be negative')
    })

    it('should throw error when promotion and relegation slots exceed total clubs', async () => {
      const invalidRulesData = {
        ...leagueData,
        clubs: ['club1', 'club2', 'club3'],
        rules: {
          promotionSlots: 2,
          relegationSlots: 2,
          points: { win: 3, draw: 1, loss: 0 }
        }
      }
      await expect(leagueService.createLeague(invalidRulesData)).rejects.toThrow('Promotion and relegation slots combined cannot exceed total number of clubs')
    })
  })

  describe('updateLeague', () => {
    const mockLeague = {
      _id: '1',
      name: 'Test League',
      country: 'Test Country',
      season: {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31')
      },
      clubs: ['club1', 'club2', 'club3'],
      rules: {
        promotionSlots: 1,
        relegationSlots: 1,
        points: { win: 3, draw: 1, loss: 0 }
      },
      standings: [],
      schedule: [],
      history: [],
      isActive: true,
      save: jest.fn().mockResolvedValue(true)
    }

    it('should update league successfully', async () => {
      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeague)
      } as any)

      const updateData = {
        name: 'Updated League',
        isActive: false
      }

      const result = await leagueService.updateLeague('1', updateData)

      expect(League.findById).toHaveBeenCalledWith('1')
      expect(result).not.toBeNull()
      expect(result?.name).toBe('Updated League')
      expect(result?.isActive).toBe(false)
      expect(mockLeague.save).toHaveBeenCalled()
    })

    it('should throw error when league not found', async () => {
      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any)

      await expect(leagueService.updateLeague('999', { name: 'Updated' })).rejects.toThrow('League not found')
    })

    it('should throw error when season start date is after end date', async () => {
      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeague)
      } as any)

      const updateData = {
        season: {
          start: new Date('2024-12-31'),
          end: new Date('2024-01-01')
        }
      }

      await expect(leagueService.updateLeague('1', updateData)).rejects.toThrow('Season start date must be before end date')
    })

    it('should throw error when promotion slots are negative', async () => {
      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeague)
      } as any)

      const updateData = {
        rules: {
          promotionSlots: -1,
          relegationSlots: 3,
          points: { win: 3, draw: 1, loss: 0 }
        }
      }

      await expect(leagueService.updateLeague('1', updateData)).rejects.toThrow('Promotion slots cannot be negative')
    })

    it('should throw error when updated promotion/relegation slots exceed total clubs', async () => {
      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeague)
      } as any)

      const updateData = {
        rules: {
          promotionSlots: 2,
          relegationSlots: 2,
          points: { win: 3, draw: 1, loss: 0 }
        }
      }

      await expect(leagueService.updateLeague('1', updateData)).rejects.toThrow('Promotion and relegation slots combined cannot exceed total number of clubs')
    })
  })

  describe('deleteLeague', () => {
    it('should delete league successfully', async () => {
      const mockLeague = {
        _id: '1',
        name: 'Test League'
      }

      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeague)
      } as any)

      League.findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeague)
      } as any)

      const result = await leagueService.deleteLeague('1')

      expect(League.findById).toHaveBeenCalledWith('1')
      expect(League.findByIdAndDelete).toHaveBeenCalledWith('1')
      expect(result).toBe(true)
    })

    it('should throw error when league not found', async () => {
      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any)

      await expect(leagueService.deleteLeague('999')).rejects.toThrow('League not found')
    })
  })

  describe('generateSchedule', () => {
    const mockLeague = {
      _id: '1',
      name: 'Test League',
      clubs: ['club1', 'club2', 'club3', 'club4'],
      schedule: [],
      save: jest.fn().mockResolvedValue(true)
    }

    it('should generate round-robin schedule for 4 clubs', async () => {
      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeague)
      } as any)

      const result = await leagueService.generateSchedule('1')

      expect(League.findById).toHaveBeenCalledWith('1')
      expect(result).not.toBeNull()
      expect(result?.schedule).toBeDefined()
      expect(result?.schedule.length).toBeGreaterThan(0)
      expect(mockLeague.save).toHaveBeenCalled()
    })

    it('should throw error when league not found', async () => {
      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any)

      await expect(leagueService.generateSchedule('999')).rejects.toThrow('League not found')
    })

    it('should throw error when clubs are not assigned', async () => {
      const leagueWithoutClubs = {
        _id: '1',
        clubs: [],
        schedule: []
      }

      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(leagueWithoutClubs)
      } as any)

      await expect(leagueService.generateSchedule('1')).rejects.toThrow('No clubs assigned to league')
    })

    it('should generate schedule for odd number of clubs (3 clubs)', async () => {
      const mockLeagueOdd = {
        _id: '1',
        name: 'Test League',
        clubs: ['club1', 'club2', 'club3'],
        schedule: [],
        save: jest.fn().mockResolvedValue(true)
      }

      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeagueOdd)
      } as any)

      const result = await leagueService.generateSchedule('1')

      expect(result).not.toBeNull()
      expect(result?.schedule).toBeDefined()
      expect(result?.schedule.length).toBeGreaterThan(0)
      expect(mockLeagueOdd.save).toHaveBeenCalled()
    })

    it('should generate schedule for 2 clubs', async () => {
      const mockLeagueTwo = {
        _id: '1',
        name: 'Test League',
        clubs: ['club1', 'club2'],
        schedule: [],
        save: jest.fn().mockResolvedValue(true)
      }

      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeagueTwo)
      } as any)

      const result = await leagueService.generateSchedule('1')

      expect(result).not.toBeNull()
      expect(result?.schedule).toBeDefined()
      expect(result?.schedule.length).toBeGreaterThan(0)
      expect(mockLeagueTwo.save).toHaveBeenCalled()
    })
  })

  describe('updateStandings', () => {
    const createMockLeague = () => ({
      _id: '1',
      name: 'Test League',
      rules: {
        promotionSlots: 3,
        relegationSlots: 3,
        points: {
          win: 3,
          draw: 1,
          loss: 0
        }
      },
      standings: [
        {
          clubId: 'club1',
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0
        },
        {
          clubId: 'club2',
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0
        }
      ],
      save: jest.fn().mockResolvedValue(true)
    })

    const matchResult = {
      leagueId: '1',
      homeClubId: 'club1',
      awayClubId: 'club2',
      homeGoals: 2,
      awayGoals: 1
    }

    it('should update standings after home win', async () => {
      const mockLeague = createMockLeague()
      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeague)
      } as any)

      const result = await leagueService.updateStandings(matchResult)

      expect(League.findById).toHaveBeenCalledWith('1')
      expect(result).not.toBeNull()
      const homeStanding = result?.standings.find(s => s.clubId === 'club1')
      expect(homeStanding?.won).toBe(1)
      expect(homeStanding?.points).toBe(3)
      expect(homeStanding?.goalsFor).toBe(2)
      expect(homeStanding?.goalsAgainst).toBe(1)

      const awayStanding = result?.standings.find(s => s.clubId === 'club2')
      expect(awayStanding?.lost).toBe(1)
      expect(awayStanding?.points).toBe(0)
      expect(awayStanding?.goalsFor).toBe(1)
      expect(awayStanding?.goalsAgainst).toBe(2)
    })

    it('should handle draw', async () => {
      const mockLeague = createMockLeague()
      const drawMatch = { ...matchResult, homeGoals: 1, awayGoals: 1 }

      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeague)
      } as any)

      const result = await leagueService.updateStandings(drawMatch)

      expect(result).not.toBeNull()
      const homeStanding = result?.standings.find(s => s.clubId === 'club1')
      const awayStanding = result?.standings.find(s => s.clubId === 'club2')
      expect(homeStanding?.drawn).toBe(1)
      expect(awayStanding?.drawn).toBe(1)
      expect(homeStanding?.points).toBe(1)
      expect(awayStanding?.points).toBe(1)
    })

    it('should throw error when league not found', async () => {
      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any)

      await expect(leagueService.updateStandings(matchResult)).rejects.toThrow('League not found')
    })

    it('should throw error when club not in standings', async () => {
      const mockLeague = createMockLeague()
      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeague)
      } as any)

      await expect(leagueService.updateStandings({ ...matchResult, homeClubId: 'club999' })).rejects.toThrow('Home club not found in standings')
    })

    it('should throw error when home goals are negative', async () => {
      const mockLeague = createMockLeague()
      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeague)
      } as any)

      await expect(leagueService.updateStandings({ ...matchResult, homeGoals: -1 })).rejects.toThrow('Goals cannot be negative')
    })

    it('should throw error when away goals are negative', async () => {
      const mockLeague = createMockLeague()
      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeague)
      } as any)

      await expect(leagueService.updateStandings({ ...matchResult, awayGoals: -1 })).rejects.toThrow('Goals cannot be negative')
    })
  })

  describe('getStandings', () => {
    const mockLeague = {
      _id: '1',
      name: 'Test League',
      standings: [
        { clubId: 'club2', played: 10, won: 8, drawn: 1, lost: 1, goalsFor: 25, goalsAgainst: 5, points: 25 },
        { clubId: 'club1', played: 10, won: 7, drawn: 2, lost: 1, goalsFor: 20, goalsAgainst: 6, points: 23 }
      ]
    }

    it('should return sorted standings', async () => {
      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeague)
      } as any)

      const result = await leagueService.getStandings('1')

      expect(League.findById).toHaveBeenCalledWith('1')
      expect(result).not.toBeNull()
      expect(result?.standings[0].points).toBeGreaterThanOrEqual(result?.standings[1]?.points ?? 0)
    })

    it('should throw error when league not found', async () => {
      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any)

      await expect(leagueService.getStandings('999')).rejects.toThrow('League not found')
    })
  })

  describe('getSchedule', () => {
    const mockLeague = {
      _id: '1',
      name: 'Test League',
      schedule: [
        {
          round: 1,
          matches: [
            { homeClubId: 'club1', awayClubId: 'club2', played: false },
            { homeClubId: 'club3', awayClubId: 'club4', played: false }
          ]
        },
        {
          round: 2,
          matches: [
            { homeClubId: 'club2', awayClubId: 'club1', played: true, homeGoals: 2, awayGoals: 1 }
          ]
        }
      ]
    }

    it('should return full league schedule when clubId not provided', async () => {
      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeague)
      } as any)

      const result = await leagueService.getSchedule('1')

      expect(League.findById).toHaveBeenCalledWith('1')
      expect(result).not.toBeNull()
      expect(result?.schedule).toHaveLength(2)
    })

    it('should return filtered schedule when clubId is provided', async () => {
      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeague)
      } as any)

      const result = await leagueService.getSchedule('1', 'club1')

      expect(result).not.toBeNull()
      const club1Matches = result?.schedule.flatMap(round => round.matches) || []
      club1Matches.forEach(match => {
        expect(match.homeClubId === 'club1' || match.awayClubId === 'club1').toBe(true)
      })
    })

    it('should throw error when league not found', async () => {
      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any)

      await expect(leagueService.getSchedule('999')).rejects.toThrow('League not found')
    })
  })

  describe('processPromotionRelegation', () => {
    const mockLeague = {
      _id: '1',
      name: 'Test League',
      rules: {
        promotionSlots: 3,
        relegationSlots: 3,
        points: { win: 3, draw: 1, loss: 0 }
      },
      standings: [
        { clubId: 'club1', played: 38, won: 30, drawn: 5, lost: 3, goalsFor: 90, goalsAgainst: 20, points: 95 },
        { clubId: 'club2', played: 38, won: 28, drawn: 6, lost: 4, goalsFor: 85, goalsAgainst: 25, points: 90 },
        { clubId: 'club3', played: 38, won: 25, drawn: 8, lost: 5, goalsFor: 80, goalsAgainst: 30, points: 83 },
        { clubId: 'club4', played: 38, won: 15, drawn: 10, lost: 13, goalsFor: 50, goalsAgainst: 50, points: 55 },
        { clubId: 'club5', played: 38, won: 10, drawn: 5, lost: 23, goalsFor: 35, goalsAgainst: 65, points: 35 },
        { clubId: 'club6', played: 38, won: 5, drawn: 3, lost: 30, goalsFor: 20, goalsAgainst: 80, points: 18 }
      ],
      save: jest.fn().mockResolvedValue(true)
    }

    it('should identify promoted and relegated clubs', async () => {
      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeague)
      } as any)

      const result = await leagueService.processPromotionRelegation('1')

      expect(League.findById).toHaveBeenCalledWith('1')
      expect(result.promoted).toHaveLength(3)
      expect(result.relegated).toHaveLength(3)
      expect(result.promoted[0].clubId).toBe('club1')
      expect(result.relegated[0].clubId).toBe('club6')
    })

    it('should throw error when league not found', async () => {
      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any)

      await expect(leagueService.processPromotionRelegation('999')).rejects.toThrow('League not found')
    })

    it('should throw error when promotion slots exceed total clubs', async () => {
      const mockLeagueInvalid = {
        _id: '1',
        name: 'Test League',
        rules: {
          promotionSlots: 10,
          relegationSlots: 3,
          points: { win: 3, draw: 1, loss: 0 }
        },
        standings: [
          { clubId: 'club1', played: 38, won: 30, drawn: 5, lost: 3, goalsFor: 90, goalsAgainst: 20, points: 95 },
          { clubId: 'club2', played: 38, won: 28, drawn: 6, lost: 4, goalsFor: 85, goalsAgainst: 25, points: 90 },
          { clubId: 'club3', played: 38, won: 25, drawn: 8, lost: 5, goalsFor: 80, goalsAgainst: 30, points: 83 }
        ],
        save: jest.fn().mockResolvedValue(true)
      }

      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeagueInvalid)
      } as any)

      await expect(leagueService.processPromotionRelegation('1')).rejects.toThrow('Promotion slots cannot exceed total number of clubs')
    })

    it('should throw error when relegation slots exceed total clubs', async () => {
      const mockLeagueInvalid = {
        _id: '1',
        name: 'Test League',
        rules: {
          promotionSlots: 3,
          relegationSlots: 10,
          points: { win: 3, draw: 1, loss: 0 }
        },
        standings: [
          { clubId: 'club1', played: 38, won: 30, drawn: 5, lost: 3, goalsFor: 90, goalsAgainst: 20, points: 95 },
          { clubId: 'club2', played: 38, won: 28, drawn: 6, lost: 4, goalsFor: 85, goalsAgainst: 25, points: 90 },
          { clubId: 'club3', played: 38, won: 25, drawn: 8, lost: 5, goalsFor: 80, goalsAgainst: 30, points: 83 }
        ],
        save: jest.fn().mockResolvedValue(true)
      }

      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeagueInvalid)
      } as any)

      await expect(leagueService.processPromotionRelegation('1')).rejects.toThrow('Relegation slots cannot exceed total number of clubs')
    })

    it('should throw error when promotion and relegation slots combined exceed total clubs', async () => {
      const mockLeagueInvalid = {
        _id: '1',
        name: 'Test League',
        rules: {
          promotionSlots: 2,
          relegationSlots: 2,
          points: { win: 3, draw: 1, loss: 0 }
        },
        standings: [
          { clubId: 'club1', played: 38, won: 30, drawn: 5, lost: 3, goalsFor: 90, goalsAgainst: 20, points: 95 },
          { clubId: 'club2', played: 38, won: 28, drawn: 6, lost: 4, goalsFor: 85, goalsAgainst: 25, points: 90 },
          { clubId: 'club3', played: 38, won: 25, drawn: 8, lost: 5, goalsFor: 80, goalsAgainst: 30, points: 83 }
        ],
        save: jest.fn().mockResolvedValue(true)
      }

      League.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeagueInvalid)
      } as any)

      await expect(leagueService.processPromotionRelegation('1')).rejects.toThrow('Promotion and relegation slots combined cannot exceed total number of clubs')
    })
  })
})
