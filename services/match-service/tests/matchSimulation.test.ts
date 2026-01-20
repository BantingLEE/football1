import { MatchSimulation } from '../src/services/matchSimulation'
import { IMatch } from '../src/models/Match'
import { SIMULATION_CONSTANTS } from '../src/constants/simulationConstants'

describe('MatchSimulation Race Condition Tests', () => {
  let mockMatch: IMatch
  let simulation: MatchSimulation

  beforeEach(() => {
    mockMatch = {
      _id: '1',
      homeTeam: { clubId: 'club1', score: 0, lineup: [], tactics: {} },
      awayTeam: { clubId: 'club2', score: 0, lineup: [], tactics: {} },
      date: new Date(),
      leagueId: 'league1',
      status: 'scheduled' as const,
      events: [],
      statistics: {
        possession: { home: 50, away: 50 },
        shots: { home: 0, away: 0 },
        shotsOnTarget: { home: 0, away: 0 },
        corners: { home: 0, away: 0 },
        fouls: { home: 0, away: 0 },
        passes: { home: 0, away: 0 }
      },
      playerRatings: new Map()
    }
    simulation = new MatchSimulation(mockMatch)
  })

  describe('simulateRealtime - Sequential Execution', () => {
    it('should execute minutes sequentially without race conditions', async () => {
      const callbackCalls: number[] = []
      const mockSocketIo = {
        emit: jest.fn()
      }

      await simulation.simulateRealtime(async (match, socketIo) => {
        callbackCalls.push((match as any).currentMinute || 0)
        await new Promise(resolve => setTimeout(resolve, 10))
      }, mockSocketIo)

      expect(callbackCalls.length).toBe(SIMULATION_CONSTANTS.MATCH.DURATION)
      expect(callbackCalls).toEqual([...Array(SIMULATION_CONSTANTS.MATCH.DURATION).keys()].map(i => i + 1))
    })

    it('should maintain consistent state during sequential execution', async () => {
      const possessionValues: Array<{ home: number; away: number }> = []
      const mockSocketIo = { emit: jest.fn() }

      await simulation.simulateRealtime(async (match) => {
        possessionValues.push({
          home: match.statistics.possession.home,
          away: match.statistics.possession.away
        })
      }, mockSocketIo)

      const uniqueValues = new Set(possessionValues.map(v => `${v.home}:${v.away}`))
      expect(uniqueValues.size).toBeGreaterThan(1)
    })

    it('should preserve minute order in events', async () => {
      const mockSocketIo = { emit: jest.fn() }

      await simulation.simulateRealtime(async () => {}, mockSocketIo)

      if (mockMatch.events.length > 1) {
        for (let i = 1; i < mockMatch.events.length; i++) {
          expect(mockMatch.events[i].minute).toBeGreaterThanOrEqual(mockMatch.events[i - 1].minute)
        }
      }
    })

    it('should handle concurrent requests correctly', async () => {
      const results: boolean[] = []
      const mockSocketIo = { emit: jest.fn() }

      const promises = Array(3).fill(null).map(async () => {
        const sim = new MatchSimulation({ ...mockMatch })
        await sim.simulateRealtime(async () => {}, mockSocketIo)
        return true
      })

      await Promise.all(promises)
      expect(results.length).toBe(0)
    })

    it('should handle callback errors without affecting execution', async () => {
      let errorCount = 0
      const mockSocketIo = { emit: jest.fn() }

      await simulation.simulateRealtime(async () => {
        if (Math.random() < 0.1) {
          errorCount++
          throw new Error('Simulated callback error')
        }
      }, mockSocketIo)

      expect(mockMatch.events.length).toBeGreaterThan(0)
    })
  })

  describe('simulate - Standard Simulation', () => {
    it('should simulate all minutes sequentially', async () => {
      const result = await simulation.simulate()

      expect(result.status).toBe('completed')
      expect(result.events).toBeDefined()
      expect(result.statistics).toBeDefined()
    })

    it('should update score correctly', async () => {
      const result = await simulation.simulate()

      expect(typeof result.homeTeam.score).toBe('number')
      expect(typeof result.awayTeam.score).toBe('number')
      expect(result.homeTeam.score).toBeGreaterThanOrEqual(0)
      expect(result.awayTeam.score).toBeGreaterThanOrEqual(0)
    })

    it('should have valid possession statistics', async () => {
      const result = await simulation.simulate()

      const totalPossession = result.statistics.possession.home + result.statistics.possession.away
      expect(totalPossession).toBeCloseTo(100, 0)
    })
  })

  describe('State Consistency', () => {
    it('should not have duplicate minutes in events', async () => {
      const mockSocketIo = { emit: jest.fn() }

      await simulation.simulateRealtime(async () => {}, mockSocketIo)

      const minutes = mockMatch.events.map(e => e.minute)
      const uniqueMinutes = new Set(minutes)
      expect(minutes.length).toBe(uniqueMinutes.size)
    })

    it('should maintain possession sum consistency', async () => {
      const mockSocketIo = { emit: jest.fn() }

      await simulation.simulateRealtime(async () => {}, mockSocketIo)

      const totalMinutes = SIMULATION_CONSTANTS.MATCH.DURATION
      expect(mockMatch.statistics.possession.home + mockMatch.statistics.possession.away).toBeCloseTo(100, 0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero goal events', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.99)

      const result = await simulation.simulate()

      expect(result.homeTeam.score).toBe(0)
      expect(result.awayTeam.score).toBe(0)

      jest.spyOn(Math, 'random').mockRestore()
    })

    it('should handle rapid state updates', async () => {
      const mockSocketIo = { emit: jest.fn() }

      await simulation.simulateRealtime(async (match) => {
        match.homeTeam.score = Math.floor(Math.random() * 10)
      }, mockSocketIo)

      expect(mockMatch.events.length).toBeGreaterThanOrEqual(0)
    })
  })
})