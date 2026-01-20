import { MatchService } from '../src/services/matchService'
import { Match } from '../src/models/Match'
import { MatchNotFoundError } from '../src/errors/matchErrors'

jest.mock('../src/models/Match')

describe('MatchService', () => {
  let matchService: MatchService

  beforeEach(() => {
    matchService = new MatchService()
  })

  describe('getAllMatches', () => {
    it('should return all matches', async () => {
      const mockMatches = [
        { _id: '1', homeTeam: { clubId: 'club1', score: 0, lineup: [], tactics: {} }, awayTeam: { clubId: 'club2', score: 0, lineup: [], tactics: {} }, date: new Date(), leagueId: 'league1', status: 'scheduled', events: [], statistics: {}, playerRatings: new Map() }
      ]

      const mockExec = jest.fn().mockResolvedValue(mockMatches)
      Match.find = jest.fn().mockReturnValue({ exec: mockExec })

      const result = await matchService.getAllMatches()

      expect(Match.find).toHaveBeenCalled()
      expect(result).toEqual(mockMatches)
    })
  })

  describe('getMatchById', () => {
    it('should return match by id', async () => {
      const matchId = '507f1f77bcf86cd799439011'
      const mockMatch = { _id: matchId, homeTeam: { clubId: 'club1', score: 0, lineup: [], tactics: {} }, awayTeam: { clubId: 'club2', score: 0, lineup: [], tactics: {} }, date: new Date(), leagueId: 'league1', status: 'scheduled', events: [], statistics: {}, playerRatings: new Map() }

      const mockExec = jest.fn().mockResolvedValue(mockMatch)
      Match.findById = jest.fn().mockReturnValue({ exec: mockExec })

      const result = await matchService.getMatchById(matchId)

      expect(Match.findById).toHaveBeenCalledWith(matchId)
      expect(result).toEqual(mockMatch)
    })

    it('should return null when match not found', async () => {
      const matchId = '507f1f77bcf86cd799439011'
      const mockExec = jest.fn().mockResolvedValue(null)
      Match.findById = jest.fn().mockReturnValue({ exec: mockExec })

      const result = await matchService.getMatchById(matchId)

      expect(Match.findById).toHaveBeenCalledWith(matchId)
      expect(result).toBeNull()
    })
  })

  describe('createMatch', () => {
    it('should create a new match with default status', async () => {
      const matchData = {
        homeTeam: { clubId: 'club1', lineup: [], tactics: {} },
        awayTeam: { clubId: 'club2', lineup: [], tactics: {} },
        date: new Date(),
        leagueId: 'league1'
      }

      Match.create = jest.fn().mockResolvedValue({
        _id: '1',
        ...matchData,
        status: 'scheduled',
        events: [],
        statistics: {},
        playerRatings: new Map()
      })

      const result = await matchService.createMatch(matchData as any)

      expect(Match.create).toHaveBeenCalled()
      expect(result.status).toBe('scheduled')
    })
  })

  describe('updateMatch', () => {
    it('should update match and return updated match', async () => {
      const matchId = '507f1f77bcf86cd799439011'
      const updateData = { status: 'completed' as const }
      const updatedMatch = { _id: matchId, homeTeam: { clubId: 'club1', score: 0, lineup: [], tactics: {} }, awayTeam: { clubId: 'club2', score: 0, lineup: [], tactics: {} }, date: new Date(), leagueId: 'league1', status: 'completed', events: [], statistics: {}, playerRatings: new Map() }

      const mockExec = jest.fn().mockResolvedValue(updatedMatch)
      Match.findByIdAndUpdate = jest.fn().mockReturnValue({ exec: mockExec })

      const result = await matchService.updateMatch(matchId, updateData)

      expect(Match.findByIdAndUpdate).toHaveBeenCalledWith(matchId, updateData, { new: true })
      expect(result).toEqual(updatedMatch)
    })

    it('should return null when match to update not found', async () => {
      const matchId = '507f1f77bcf86cd799439011'
      const updateData = { status: 'completed' as const }

      const mockExec = jest.fn().mockResolvedValue(null)
      Match.findByIdAndUpdate = jest.fn().mockReturnValue({ exec: mockExec })

      const result = await matchService.updateMatch(matchId, updateData)

      expect(result).toBeNull()
    })
  })

  describe('simulateMatch', () => {
    it('should simulate a match and update score', async () => {
      const matchId = '507f1f77bcf86cd799439011'
      const mockMatch = {
        _id: matchId,
        homeTeam: { clubId: 'club1', score: 0, lineup: [], tactics: {} },
        awayTeam: { clubId: 'club2', score: 0, lineup: [], tactics: {} },
        events: [],
        statistics: {
          possession: { home: 0, away: 0 },
          shots: { home: 0, away: 0 },
          shotsOnTarget: { home: 0, away: 0 },
          corners: { home: 0, away: 0 },
          fouls: { home: 0, away: 0 },
          passes: { home: 0, away: 0 }
        },
        playerRatings: new Map()
      }

      const mockExec = jest.fn().mockResolvedValue(mockMatch)
      Match.findById = jest.fn().mockReturnValue({ exec: mockExec })

      const result = await matchService.simulateMatch(matchId)

      expect(Match.findById).toHaveBeenCalledWith(matchId)
      expect(result).toBeTruthy()
      if (result) {
        expect(result.homeTeam.score).toBeGreaterThanOrEqual(0)
      }
    })

    it('should throw MatchNotFoundError when match does not exist', async () => {
      const matchId = '507f1f77bcf86cd799439011'
      const mockExec = jest.fn().mockResolvedValue(null)
      Match.findById = jest.fn().mockReturnValue({ exec: mockExec })

      await expect(matchService.simulateMatch(matchId)).rejects.toThrow(MatchNotFoundError)
    })
  })
})
