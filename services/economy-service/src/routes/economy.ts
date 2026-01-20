import { Router } from 'express'
import * as economyController from '../controllers/economyController'

const router = Router()

router.get('/clubs/:id/income', economyController.calculateWeeklyIncome)
router.get('/clubs/:id/expenses', economyController.calculateWeeklyExpenses)
router.patch('/clubs/:id/budget', economyController.updateBudget)
router.post('/clubs/:id/report', economyController.getFinancialReport)
router.get('/clubs/:id/records', economyController.getFinancialRecords)
router.post('/records', economyController.createFinancialRecord)
router.post('/transfers', economyController.processTransfer)
router.get('/transfers', economyController.getTransferList)

export default router
