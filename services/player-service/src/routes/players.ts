import { Router } from 'express'
import * as playerController from '../controllers/playerController'

const router = Router()

router.get('/', playerController.getAllPlayers)
router.get('/:id', playerController.getPlayerById)
router.get('/club/:clubId', playerController.getPlayersByClub)
router.post('/', playerController.createPlayer)
router.put('/:id', playerController.updatePlayer)
router.delete('/:id', playerController.deletePlayer)
router.post('/:id/transfer', playerController.transferPlayer)
router.post('/:id/train', playerController.trainPlayer)

export default router