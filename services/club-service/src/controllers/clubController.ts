import { Request, Response, NextFunction } from 'express'
import { ClubService } from '../services/clubService'
import { createClubSchema, updateClubSchema, updateFinancesSchema, idSchema } from '../validators/clubValidator'

const clubService = new ClubService()

const handleValidationError = (error: unknown, res: Response) => {
  if (error instanceof Error && error.message.includes('Invalid club ID format')) {
    return res.status(400).json({ error: error.message })
  }
  if (error instanceof Error && error.message.includes('Validation error')) {
    return res.status(400).json({ error: error.message })
  }
  if (error instanceof Error && error.message.includes('Club not found')) {
    return res.status(404).json({ error: error.message })
  }
  if (error instanceof Error && error.message.includes('Insufficient funds')) {
    return res.status(400).json({ error: error.message })
  }
  return res.status(500).json({ error: 'Internal server error' })
}

export const getAllClubs = async (req: Request, res: Response) => {
  try {
    const clubs = await clubService.getAllClubs()
    res.json(clubs)
  } catch (error) {
    handleValidationError(error, res)
  }
}

export const getClubById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { error } = idSchema.validate(id)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const club = await clubService.getClubById(id)
    if (!club) {
      return res.status(404).json({ error: 'Club not found' })
    }
    res.json(club)
  } catch (error) {
    handleValidationError(error, res)
  }
}

export const createClub = async (req: Request, res: Response) => {
  try {
    const { error, value } = createClubSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const club = await clubService.createClub(value)
    res.status(201).json(club)
  } catch (error) {
    handleValidationError(error, res)
  }
}

export const updateClub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const idError = idSchema.validate(id)
    if (idError.error) {
      return res.status(400).json({ error: idError.error.details[0].message })
    }

    const { error, value } = updateClubSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const club = await clubService.updateClub(id, value)
    res.json(club)
  } catch (error) {
    handleValidationError(error, res)
  }
}

export const deleteClub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { error } = idSchema.validate(id)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const club = await clubService.deleteClub(id)
    res.json({ message: 'Club deleted successfully' })
  } catch (error) {
    handleValidationError(error, res)
  }
}

export const updateFinances = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const idError = idSchema.validate(id)
    if (idError.error) {
      return res.status(400).json({ error: idError.error.details[0].message })
    }

    const { error, value } = updateFinancesSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const club = await clubService.updateFinances(id, value.income, value.expense)
    if (!club) {
      return res.status(404).json({ error: 'Club not found' })
    }
    res.json(club)
  } catch (error) {
    handleValidationError(error, res)
  }
}
