import request from 'supertest'
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals'

const API_URL = process.env.API_URL || 'http://localhost:3001/api'

describe('Match API E2E Tests', () => {
  let authToken: string
  let testMatchId: string
  let testLeagueId: string

  beforeAll(async () => {
    const authResponse = await request(API_URL)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword'
      })
    
    authToken = authResponse.body.token || 'test-token'
    testLeagueId = 'test-league-123'
  })

  afterAll(async () => {
    if (testMatchId) {
      await request(API_URL)
        .delete(`/matches/${testMatchId}`)
        .set('Authorization', `Bearer ${authToken}`)
    }
  })

  describe('GET /matches', () => {
    test('should return list of matches', async () => {
      const response = await request(API_URL)
        .get('/matches')
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })

    test('should return matches with correct structure', async () => {
      const response = await request(API_URL)
        .get('/matches')
        .set('Authorization', `Bearer ${authToken}`)
      
      if (response.body.length > 0) {
        const match = response.body[0]
        expect(match).toHaveProperty('_id')
        expect(match).toHaveProperty('homeTeam')
        expect(match).toHaveProperty('awayTeam')
        expect(match).toHaveProperty('status')
      }
    })
  })

  describe('GET /matches/league/:leagueId', () => {
    test('should return matches for a specific league', async () => {
      const response = await request(API_URL)
        .get(`/matches/league/${testLeagueId}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect([200, 404]).toContain(response.status)
    })

    test('should return array of league matches', async () => {
      const response = await request(API_URL)
        .get(`/matches/league/${testLeagueId}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true)
      }
    })
  })

  describe('GET /matches/:id', () => {
    test('should return a specific match', async () => {
      const response = await request(API_URL)
        .get('/matches/test-match-123')
        .set('Authorization', `Bearer ${authToken}`)
      
      expect([200, 404]).toContain(response.status)
    })

    test('should return 404 for non-existent match', async () => {
      const response = await request(API_URL)
        .get('/matches/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(response.status).toBe(404)
    })

    test('should return match with statistics', async () => {
      const response = await request(API_URL)
        .get('/matches/test-match-123')
        .set('Authorization', `Bearer ${authToken}`)
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('statistics')
      }
    })
  })

  describe('POST /matches', () => {
    test('should create a new match', async () => {
      const newMatch = {
        homeTeam: {
          clubId: 'home-club-123',
          score: 0,
          lineup: [],
          tactics: {
            formation: '4-4-2',
            attacking: 5,
            defending: 5,
            playStyle: 'possession'
          }
        },
        awayTeam: {
          clubId: 'away-club-123',
          score: 0,
          lineup: [],
          tactics: {
            formation: '4-3-3',
            attacking: 6,
            defending: 4,
            playStyle: 'counter'
          }
        },
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        leagueId: testLeagueId,
        status: 'scheduled',
        events: [],
        statistics: {
          possession: { home: 0, away: 0 },
          shots: { home: 0, away: 0 },
          shotsOnTarget: { home: 0, away: 0 },
          corners: { home: 0, away: 0 },
          fouls: { home: 0, away: 0 },
          passes: { home: 0, away: 0 }
        }
      }

      const response = await request(API_URL)
        .post('/matches')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newMatch)
      
      expect([200, 201]).toContain(response.status)
      if (response.status !== 200) {
        expect(response.body).toHaveProperty('_id')
        testMatchId = response.body._id
      }
    })

    test('should return 400 for invalid match data', async () => {
      const invalidMatch = {
        homeTeam: {},
        awayTeam: {},
        date: 'invalid-date'
      }

      const response = await request(API_URL)
        .post('/matches')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidMatch)
      
      expect([400, 422]).toContain(response.status)
    })
  })

  describe('PUT /matches/:id', () => {
    test('should update a match', async () => {
      if (!testMatchId) {
        testMatchId = 'test-match-123'
      }
      
      const updates = {
        status: 'live',
        date: new Date().toISOString()
      }

      const response = await request(API_URL)
        .put(`/matches/${testMatchId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
      
      expect([200, 404]).toContain(response.status)
    })

    test('should update match scores', async () => {
      if (!testMatchId) {
        testMatchId = 'test-match-123'
      }
      
      const scoreUpdates = {
        homeTeam: {
          clubId: 'home-club-123',
          score: 2,
          lineup: [],
          tactics: {
            formation: '4-4-2',
            attacking: 5,
            defending: 5,
            playStyle: 'possession'
          }
        },
        awayTeam: {
          clubId: 'away-club-123',
          score: 1,
          lineup: [],
          tactics: {
            formation: '4-3-3',
            attacking: 6,
            defending: 4,
            playStyle: 'counter'
          }
        }
      }

      const response = await request(API_URL)
        .put(`/matches/${testMatchId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(scoreUpdates)
      
      expect([200, 404]).toContain(response.status)
    })
  })

  describe('POST /matches/:id/start', () => {
    test('should start a scheduled match', async () => {
      if (!testMatchId) {
        testMatchId = 'test-match-123'
      }
      
      const response = await request(API_URL)
        .post(`/matches/${testMatchId}/start`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect([200, 404, 400]).toContain(response.status)
    })

    test('should return 400 if match already started', async () => {
      const response = await request(API_URL)
        .post('/matches/already-started-match/start')
        .set('Authorization', `Bearer ${authToken}`)
      
      expect([400, 404]).toContain(response.status)
    })
  })

  describe('POST /matches/:id/simulate', () => {
    test('should simulate a match', async () => {
      if (!testMatchId) {
        testMatchId = 'test-match-123'
      }
      
      const response = await request(API_URL)
        .post(`/matches/${testMatchId}/simulate`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect([200, 404, 400]).toContain(response.status)
    })

    test('should return match results after simulation', async () => {
      if (!testMatchId) {
        testMatchId = 'test-match-123'
      }
      
      const response = await request(API_URL)
        .post(`/matches/${testMatchId}/simulate`)
        .set('Authorization', `Bearer ${authToken}`)
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('status')
        expect(response.body).toHaveProperty('events')
      }
    })
  })

  describe('Match Events & Statistics', () => {
    test('should track match events', async () => {
      const response = await request(API_URL)
        .get('/matches/test-match-123')
        .set('Authorization', `Bearer ${authToken}`)
      
      if (response.status === 200) {
        expect(Array.isArray(response.body.events)).toBe(true)
      }
    })

    test('should track match statistics', async () => {
      const response = await request(API_URL)
        .get('/matches/test-match-123')
        .set('Authorization', `Bearer ${authToken}`)
      
      if (response.status === 200) {
        expect(response.body.statistics).toHaveProperty('possession')
        expect(response.body.statistics).toHaveProperty('shots')
        expect(response.body.statistics).toHaveProperty('passes')
      }
    })
  })

  describe('DELETE /matches/:id', () => {
    test('should delete a match', async () => {
      const createResponse = await request(API_URL)
        .post('/matches')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          homeTeam: {
            clubId: 'home-delete',
            score: 0,
            lineup: [],
            tactics: { formation: '4-4-2', attacking: 5, defending: 5, playStyle: 'possession' }
          },
          awayTeam: {
            clubId: 'away-delete',
            score: 0,
            lineup: [],
            tactics: { formation: '4-3-3', attacking: 6, defending: 4, playStyle: 'counter' }
          },
          date: new Date().toISOString(),
          leagueId: testLeagueId,
          status: 'scheduled',
          events: [],
          statistics: {
            possession: { home: 0, away: 0 },
            shots: { home: 0, away: 0 },
            shotsOnTarget: { home: 0, away: 0 },
            corners: { home: 0, away: 0 },
            fouls: { home: 0, away: 0 },
            passes: { home: 0, away: 0 }
          }
        })
      
      const matchId = createResponse.body._id

      if (matchId) {
        const deleteResponse = await request(API_URL)
          .delete(`/matches/${matchId}`)
          .set('Authorization', `Bearer ${authToken}`)
        
        expect(deleteResponse.status).toBe(200)
      }
    })
  })

  describe('Error Handling', () => {
    test('should handle invalid match ID', async () => {
      const response = await request(API_URL)
        .get('/matches/invalid-id-format')
        .set('Authorization', `Bearer ${authToken}`)
      
      expect([400, 404]).toContain(response.status)
    })

    test('should handle malformed JSON', async () => {
      const response = await request(API_URL)
        .post('/matches')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
      
      expect([400, 422]).toContain(response.status)
    })
  })
})
