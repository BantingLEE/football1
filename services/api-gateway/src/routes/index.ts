import { Router } from 'express'

const router = Router()

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' })
})

// Club service routes
router.use('/clubs', (req, res, next) => {
  // Proxy to club service (http://localhost:3002)
  res.json({ message: 'Club service endpoint' })
})

// Player service routes
router.use('/players', (req, res, next) => {
  // Proxy to player service (http://localhost:3003)
  res.json({ message: 'Player service endpoint' })
})

// Match service routes
router.use('/matches', (req, res, next) => {
  // Proxy to match service (http://localhost:3004)
  res.json({ message: 'Match service endpoint' })
})

export default router
