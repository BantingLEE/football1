import { Router } from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { authMiddleware } from '../middleware/auth'

const router = Router()

const CLUB_SERVICE_URL = process.env.CLUB_SERVICE_URL || 'http://localhost:3002'
const PLAYER_SERVICE_URL = process.env.PLAYER_SERVICE_URL || 'http://localhost:3003'
const MATCH_SERVICE_URL = process.env.MATCH_SERVICE_URL || 'http://localhost:3004'

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' })
})

router.use('/clubs', authMiddleware, createProxyMiddleware({
  target: CLUB_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/clubs': '/clubs' }
}))

router.use('/players', authMiddleware, createProxyMiddleware({
  target: PLAYER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/players': '/players' }
}))

router.use('/matches', authMiddleware, createProxyMiddleware({
  target: MATCH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/matches': '/matches' }
}))

export default router
