import { Request, Response, NextFunction } from 'express'
import { MatchService } from '../services/matchService'
import { createMatchSchema, updateMatchSchema, idSchema } from '../validators/matchValidator'

const matchService = new MatchService()

const handleValidationError = (error: unknown, res: Response) => {
  if (error instanceof Error && error.message.includes('Invalid match ID format')) {
    return res.status(400).json({ error: error.message })
  }
  if (error instanceof Error && error.message.includes('Validation error')) {
    return res.status(400).json({ error: error.message })
  }
  if (error instanceof Error && error.message.includes('Match not found')) {
    return res.status(404).json({ error: error.message })
  }
  return res.status(500).json({ error: 'Internal server error' })
}

export const getAllMatches = async (req: Request, res: Response) => {
  try {
    const matches = await matchService.getAllMatches()
    res.json(matches)
  } catch (error) {
    handleValidationError(error, res)
  }
}

export const getMatchById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { error } = idSchema.validate(id)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const match = await matchService.getMatchById(id)
    if (!match) {
      return res.status(404).json({ error: 'Match not found' })
    }
    res.json(match)
  } catch (error) {
    handleValidationError(error, res)
  }
}

export const getMatchesByLeague = async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.params
    const { error } = idSchema.validate(leagueId)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const matches = await matchService.getMatchesByLeague(leagueId)
    res.json(matches)
  } catch (error) {
    handleValidationError(error, res)
  }
}

export const createMatch = async (req: Request, res: Response) => {
  try {
    const { error, value } = createMatchSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const match = await matchService.createMatch(value)
    res.status(201).json(match)
  } catch (error) {
    handleValidationError(error, res)
  }
}

export const startMatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { error } = idSchema.validate(id)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const socketIo = (req as any).io
    const match = await matchService.startMatch(id, socketIo)
    if (!match) {
      return res.status(404).json({ error: 'Match not found' })
    }
    res.json(match)
  } catch (error) {
    handleValidationError(error, res)
  }
}

export const simulateMatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { error } = idSchema.validate(id)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const match = await matchService.simulateMatch(id)
    if (!match) {
      return res.status(404).json({ error: 'Match not found' })
    }
    res.json(match)
  } catch (error) {
    handleValidationError(error, res)
  }
}

export const updateMatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const idError = idSchema.validate(id)
    if (idError.error) {
      return res.status(400).json({ error: idError.error.details[0].message })
    }

    const { error, value } = updateMatchSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const match = await matchService.updateMatch(id, value)
    if (!match) {
      return res.status(404).json({ error: 'Match not found' })
    }
    res.json(match)
  } catch (error) {
    handleValidationError(error, res)
  }
}
