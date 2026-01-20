import { Router } from 'express'
import * as youthController from '../controllers/youthController'

const router = Router()

router.post('/club/:clubId/generate', youthController.generateYouthPlayers)
router.put('/club/:clubId/upgrade', youthController.upgradeFacility)
router.get('/club/:clubId', youthController.getYouthPlayers)
router.post('/player/:playerId/promote', youthController.promoteToFirstTeam)
router.post('/player/:playerId/train', youthController.trainYouthPlayer)
router.post('/retire', youthController.retireOldPlayers)
router.get('/capacity/:level', youthController.getFacilityCapacity)

export default router
