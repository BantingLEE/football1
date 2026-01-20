import { Router } from 'express'
import * as leagueController from '../controllers/leagueController'

const router = Router()

router.get('/', leagueController.getLeagues)
router.post('/', leagueController.createLeague)
router.get('/:id', leagueController.getLeagueById)
router.put('/:id', leagueController.updateLeague)
router.delete('/:id', leagueController.deleteLeague)

router.post('/:id/schedule', leagueController.generateSchedule)
router.put('/standings', leagueController.updateStandings)
router.get('/:id/standings', leagueController.getStandings)
router.get('/:id/schedule', leagueController.getSchedule)
router.post('/:id/promotion-relegation', leagueController.processPromotionRelegation)

export default router
