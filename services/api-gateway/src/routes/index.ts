import { Router } from 'express'
import { setApiVersion, getVersionInfo } from '../middleware/apiVersion'

const router = Router()

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' })
})

router.get('/version', getVersionInfo)

router.use('/v1', setApiVersion('1.0.0'), require('./v1').default)

export default router
