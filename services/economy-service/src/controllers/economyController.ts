import { Request, Response } from 'express'
import { EconomyService } from '../services/economyService'
import {
  processTransferSchema,
  getTransferListSchema,
  updateBudgetSchema,
  getFinancialReportSchema,
  clubIdSchema,
  createFinancialRecordSchema,
  getFinancialRecordsQuerySchema
} from '../validators/economyValidator'
import { FinancialRecord } from '../models/FinancialRecord'

const economyService = new EconomyService()

const handleValidationError = (error: unknown, res: Response) => {
  if (error instanceof Error && error.message.includes('Invalid club ID format')) {
    return res.status(400).json({ error: error.message })
  }
  if (error instanceof Error && error.message.includes('Invalid player ID format')) {
    return res.status(400).json({ error: error.message })
  }
  if (error instanceof Error && error.message.includes('Invalid from club ID format')) {
    return res.status(400).json({ error: error.message })
  }
  if (error instanceof Error && error.message.includes('Invalid to club ID format')) {
    return res.status(400).json({ error: error.message })
  }
  if (error instanceof Error && error.message.includes('Invalid period')) {
    return res.status(400).json({ error: error.message })
  }
  if (error instanceof Error && error.message.includes('Transfer fee must be positive')) {
    return res.status(400).json({ error: error.message })
  }
  if (error instanceof Error && error.message.includes('Cannot transfer within the same club')) {
    return res.status(400).json({ error: error.message })
  }
  if (error instanceof Error && error.message.includes('Insufficient funds')) {
    return res.status(400).json({ error: error.message })
  }
  if (error instanceof Error && error.message.includes('Club not found')) {
    return res.status(404).json({ error: error.message })
  }
  return res.status(500).json({ error: 'Internal server error' })
}

export const calculateWeeklyIncome = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { error } = clubIdSchema.validate(id)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const result = await economyService.calculateWeeklyIncome(id)
    res.json(result)
  } catch (error) {
    handleValidationError(error, res)
  }
}

export const calculateWeeklyExpenses = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { error } = clubIdSchema.validate(id)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const result = await economyService.calculateWeeklyExpenses(id)
    res.json(result)
  } catch (error) {
    handleValidationError(error, res)
  }
}

export const processTransfer = async (req: Request, res: Response) => {
  try {
    const { error, value } = processTransferSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const result = await economyService.processTransfer(value)
    res.status(201).json(result)
  } catch (error) {
    handleValidationError(error, res)
  }
}

export const getTransferList = async (req: Request, res: Response) => {
  try {
    const { error, value } = getTransferListSchema.validate(req.query)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const result = await economyService.getTransferList(value)
    res.json(result)
  } catch (error) {
    handleValidationError(error, res)
  }
}

export const updateBudget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const idError = clubIdSchema.validate(id)
    if (idError.error) {
      return res.status(400).json({ error: idError.error.details[0].message })
    }

    const { error, value } = updateBudgetSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const result = await economyService.updateBudget(id, value.income, value.expense)
    res.json(result)
  } catch (error) {
    handleValidationError(error, res)
  }
}

export const getFinancialReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const idError = clubIdSchema.validate(id)
    if (idError.error) {
      return res.status(400).json({ error: idError.error.details[0].message })
    }

    const { error, value } = getFinancialReportSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const result = await economyService.getFinancialReport(id, value.period)
    res.json(result)
  } catch (error) {
    handleValidationError(error, res)
  }
}

export const createFinancialRecord = async (req: Request, res: Response) => {
  try {
    const { error, value } = createFinancialRecordSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const record = await FinancialRecord.create(value)
    res.status(201).json(record)
  } catch (error) {
    handleValidationError(error, res)
  }
}

export const getFinancialRecords = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const idError = clubIdSchema.validate(id)
    if (idError.error) {
      return res.status(400).json({ error: idError.error.details[0].message })
    }

    const { error, value } = getFinancialRecordsQuerySchema.validate(req.query)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { recordType, type, limit, skip } = value

    const query: {
      clubId: string
      recordType?: string
      type?: string
    } = { clubId: id }
    if (recordType) {
      query.recordType = recordType
    }
    if (type) {
      query.type = type
    }

    const records = await FinancialRecord.find(query)
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip)
      .exec()

    res.json(records)
  } catch (error) {
    handleValidationError(error, res)
  }
}
