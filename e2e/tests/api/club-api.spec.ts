import request from 'supertest'
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals'

const API_URL = process.env.API_URL || 'http://localhost:3001/api'

describe('Club API E2E Tests', () => {
  let authToken: string
  let testClubId: string

  beforeAll(async () => {
    const authResponse = await request(API_URL)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword'
      })
    
    authToken = authResponse.body.token || 'test-token'
  })

  afterAll(async () => {
    if (testClubId) {
      await request(API_URL)
        .delete(`/clubs/${testClubId}`)
        .set('Authorization', `Bearer ${authToken}`)
    }
  })

  describe('GET /clubs', () => {
    test('should return list of clubs', async () => {
      const response = await request(API_URL)
        .get('/clubs')
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThan(0)
    })

    test('should return clubs with correct structure', async () => {
      const response = await request(API_URL)
        .get('/clubs')
        .set('Authorization', `Bearer ${authToken}`)
      
      if (response.body.length > 0) {
        const club = response.body[0]
        expect(club).toHaveProperty('_id')
        expect(club).toHaveProperty('name')
        expect(club).toHaveProperty('budget')
        expect(club).toHaveProperty('stadium')
      }
    })

    test('should return 401 without auth token', async () => {
      const response = await request(API_URL)
        .get('/clubs')
      
      expect(response.status).toBe(401)
    })
  })

  describe('GET /clubs/:id', () => {
    test('should return a specific club', async () => {
      const response = await request(API_URL)
        .get('/clubs/test-club-123')
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('_id')
      expect(response.body).toHaveProperty('name')
    })

    test('should return 404 for non-existent club', async () => {
      const response = await request(API_URL)
        .get('/clubs/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(response.status).toBe(404)
    })
  })

  describe('POST /clubs', () => {
    test('should create a new club', async () => {
      const newClub = {
        name: 'Test FC E2E',
        stadium: 'Test Stadium',
        founded: 2024,
        budget: 10000000,
        tacticalPreference: {
          formation: '4-4-2',
          attacking: 5,
          defending: 5
        }
      }

      const response = await request(API_URL)
        .post('/clubs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newClub)
      
      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('_id')
      expect(response.body.name).toBe(newClub.name)
      testClubId = response.body._id
    })

    test('should return 400 for invalid club data', async () => {
      const invalidClub = {
        name: '',
        budget: -100
      }

      const response = await request(API_URL)
        .post('/clubs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidClub)
      
      expect(response.status).toBe(400)
    })
  })

  describe('PUT /clubs/:id', () => {
    test('should update a club', async () => {
      const updates = {
        budget: 15000000
      }

      const response = await request(API_URL)
        .put(`/clubs/${testClubId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
      
      expect(response.status).toBe(200)
      expect(response.body.budget).toBe(updates.budget)
    })

    test('should return 404 for non-existent club', async () => {
      const response = await request(API_URL)
        .put('/clubs/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' })
      
      expect(response.status).toBe(404)
    })
  })

  describe('PATCH /clubs/:id/finances', () => {
    test('should update club finances', async () => {
      const finances = {
        income: 5000000,
        expenses: 3000000
      }

      const response = await request(API_URL)
        .patch(`/clubs/${testClubId}/finances`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(finances)
      
      expect(response.status).toBe(200)
    })

    test('should return 400 for invalid financial data', async () => {
      const invalidFinances = {
        income: -1000
      }

      const response = await request(API_URL)
        .patch(`/clubs/${testClubId}/finances`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidFinances)
      
      expect(response.status).toBe(400)
    })
  })

  describe('DELETE /clubs/:id', () => {
    test('should delete a club', async () => {
      const createResponse = await request(API_URL)
        .post('/clubs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'To Be Deleted',
          stadium: 'Delete Stadium',
          founded: 2024,
          budget: 1000000
        })
      
      const clubId = createResponse.body._id

      const deleteResponse = await request(API_URL)
        .delete(`/clubs/${clubId}`)
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(deleteResponse.status).toBe(200)
    })

    test('should return 404 for non-existent club', async () => {
      const response = await request(API_URL)
        .delete('/clubs/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(response.status).toBe(404)
    })
  })

  describe('Authentication & Authorization', () => {
    test('should reject requests with invalid token', async () => {
      const response = await request(API_URL)
        .get('/clubs')
        .set('Authorization', 'Bearer invalid-token')
      
      expect(response.status).toBe(401)
    })

    test('should reject requests without token', async () => {
      const response = await request(API_URL)
        .get('/clubs')
      
      expect(response.status).toBe(401)
    })
  })
})
