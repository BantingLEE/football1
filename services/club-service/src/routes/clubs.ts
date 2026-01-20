import { Router } from 'express'
import * as clubController from '../controllers/clubController'

const router = Router()

router.get('/', clubController.getAllClubs)
router.get('/:id', clubController.getClubById)
router.post('/', clubController.createClub)
router.put('/:id', clubController.updateClub)
router.delete('/:id', clubController.deleteClub)
router.patch('/:id/finances', clubController.updateFinances)

export default router
