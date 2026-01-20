import { Router } from 'express'
import * as matchController from '../controllers/matchController'

const router = Router()

router.get('/', matchController.getAllMatches)
router.get('/league/:leagueId', matchController.getMatchesByLeague)
router.get('/:id', matchController.getMatchById)
router.post('/', matchController.createMatch)
router.put('/:id', matchController.updateMatch)
router.post('/:id/start', matchController.startMatch)
router.post('/:id/simulate', matchController.simulateMatch)

export default router
