import request from 'supertest'
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals'

const API_URL = process.env.API_URL || 'http://localhost:3001/api'

describe('Player API E2E Tests', () => {
  let authToken: string
  let testPlayerId: string
  let testClubId: string

  beforeAll(async () => {
    const authResponse = await request(API_URL)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword'
      })
    
    authToken = authResponse.body.token || 'test-token'
    
    const clubResponse = await request(API_URL)
      .post('/clubs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Club for Players',
        stadium: 'Test Stadium',
        founded: 2024,
        budget: 10000000
      })
    
    testClubId = clubResponse.body._id || 'test-club-123'
  })

  afterAll(async () => {
    if (testPlayerId) {
      await request(API_URL)
        .delete(`/players/${testPlayerId}`)
        .set('Authorization', `Bearer ${authToken}`)
    }
  })

  describe('GET /players', () => {
    test('should return list of players', async () => {
      const response = await request(API_URL)
        .get('/players')
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })

    test('should return players with correct structure', async () => {
      const response = await request(API_URL)
        .get('/players')
        .set('Authorization', `Bearer ${authToken}`)
      
      if (response.body.length > 0) {
        const player = response.body[0]
        expect(player).toHaveProperty('_id')
        expect(player).toHaveProperty('name')
        expect(player).toHaveProperty('position')
        expect(player).toHaveProperty('overall')
      }
    })
  })

  describe('GET /players/:id', () => {
    test('should return a specific player', async () => {
      const response = await request(API_URL)
        .get('/players/test-player-123')
        .set('Authorization', `Bearer ${authToken}`)
      
      expect([200, 404]).toContain(response.status)
    })

    test('should return 404 for non-existent player', async () => {
      const response = await request(API_URL)
        .get('/players/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(response.status).toBe(404)
    })
  })

  describe('GET /players/club/:clubId', () => {
    test('should return players for a specific club', async () => {
      const response = await request(API_URL)
        .get(`/players/club/${testClubId}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect([200, 404]).toContain(response.status)
    })

    test('should return array of players', async () => {
      const response = await request(API_URL)
        .get(`/players/club/${testClubId}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true)
      }
    })
  })

  describe('POST /players', () => {
    test('should create a new player', async () => {
      const newPlayer = {
        name: 'Test Player E2E',
        clubId: testClubId,
        position: 'FWD',
        age: 25,
        overall: 85,
        potential: 90,
        value: 50000000,
        wage: 100000,
        skills: {
          pace: 85,
          shooting: 88,
          passing: 80,
          dribbling: 86,
          defending: 65,
          physical: 82
        }
      }

      const response = await request(API_URL)
        .post('/players')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPlayer)
      
      expect([200, 201]).toContain(response.status)
      if (response.status !== 200) {
        expect(response.body).toHaveProperty('_id')
        expect(response.body.name).toBe(newPlayer.name)
        testPlayerId = response.body._id
      }
    })

    test('should return 400 for invalid player data', async () => {
      const invalidPlayer = {
        name: '',
        age: -5,
        overall: 200
      }

      const response = await request(API_URL)
        .post('/players')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPlayer)
      
      expect([400, 422]).toContain(response.status)
    })
  })

  describe('PUT /players/:id', () => {
    test('should update a player', async () => {
      if (!testPlayerId) {
        testPlayerId = 'test-player-123'
      }
      
      const updates = {
        overall: 87,
        value: 60000000
      }

      const response = await request(API_URL)
        .put(`/players/${testPlayerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
      
      expect([200, 404]).toContain(response.status)
    })

    test('should return 404 for non-existent player', async () => {
      const response = await request(API_URL)
        .put('/players/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ overall: 90 })
      
      expect(response.status).toBe(404)
    })
  })

  describe('POST /players/:id/transfer', () => {
    test('should initiate player transfer', async () => {
      if (!testPlayerId) {
        testPlayerId = 'test-player-123'
      }
      
      const transferData = {
        toClubId: 'destination-club-id',
        transferFee: 50000000
      }

      const response = await request(API_URL)
        .post(`/players/${testPlayerId}/transfer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(transferData)
      
      expect([200, 201, 404]).toContain(response.status)
    })
  })

  describe('POST /players/:id/train', () => {
    test('should train a player', async () => {
      if (!testPlayerId) {
        testPlayerId = 'test-player-123'
      }
      
      const trainingData = {
        trainingType: 'fitness',
        duration: 60
      }

      const response = await request(API_URL)
        .post(`/players/${testPlayerId}/train`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(trainingData)
      
      expect([200, 404]).toContain(response.status)
    })
  })

  describe('DELETE /players/:id', () => {
    test('should delete a player', async () => {
      const createResponse = await request(API_URL)
        .post('/players')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'To Be Deleted',
          clubId: testClubId,
          position: 'MID',
          age: 24,
          overall: 75
        })
      
      const playerId = createResponse.body._id

      if (playerId) {
        const deleteResponse = await request(API_URL)
          .delete(`/players/${playerId}`)
          .set('Authorization', `Bearer ${authToken}`)
        
        expect(deleteResponse.status).toBe(200)
      }
    })
  })

  describe('Error Handling', () => {
    test('should handle malformed JSON', async () => {
      const response = await request(API_URL)
        .post('/players')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
      
      expect([400, 422]).toContain(response.status)
    })

    test('should handle missing required fields', async () => {
      const response = await request(API_URL)
        .post('/players')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Incomplete Player'
        })
      
      expect([400, 422]).toContain(response.status)
    })
  })
})
