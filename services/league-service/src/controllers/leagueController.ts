import { Request, Response } from 'express'
import { LeagueService } from '../services/leagueService'
import { leagueCreateSchema, leagueUpdateSchema, matchResultSchema } from '../validation/leagueValidation'

const leagueService = new LeagueService()

export const getLeagues = async (req: Request, res: Response) => {
  try {
    const leagues = await leagueService.getLeagues()
    res.json(leagues)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch leagues' })
  }
}

export const createLeague = async (req: Request, res: Response) => {
  try {
    const { error, value } = leagueCreateSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }
    const league = await leagueService.createLeague(value)
    res.status(201).json(league)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create league' })
  }
}

export const getLeagueById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ error: 'League ID is required' })
    }
    const league = await leagueService.getStandings(id)
    if (!league) {
      return res.status(404).json({ error: 'League not found' })
    }
    res.json(league)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch league' })
  }
}

export const updateLeague = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ error: 'League ID is required' })
    }

    const { error, value } = leagueUpdateSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const league = await leagueService.updateLeague(id, value)
    if (!league) {
      return res.status(404).json({ error: 'League not found' })
    }
    res.json(league)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update league' })
  }
}

export const deleteLeague = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ error: 'League ID is required' })
    }
    const result = await leagueService.deleteLeague(id)
    res.status(204).send()
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500
    res.status(statusCode).json({ error: error instanceof Error ? error.message : 'Failed to delete league' })
  }
}

export const generateSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ error: 'League ID is required' })
    }
    const league = await leagueService.generateSchedule(id)
    if (!league) {
      return res.status(404).json({ error: 'League not found' })
    }
    res.json(league)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate schedule' })
  }
}

export const updateStandings = async (req: Request, res: Response) => {
  try {
    const { error, value } = matchResultSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }
    const league = await leagueService.updateStandings(value)
    if (!league) {
      return res.status(404).json({ error: 'League not found' })
    }
    res.json(league)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update standings' })
  }
}

export const getStandings = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ error: 'League ID is required' })
    }
    const league = await leagueService.getStandings(id)
    if (!league) {
      return res.status(404).json({ error: 'League not found' })
    }
    res.json(league)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch standings' })
  }
}

export const getSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { clubId } = req.query

    if (!id) {
      return res.status(400).json({ error: 'League ID is required' })
    }

    const league = await leagueService.getSchedule(id, clubId as string)
    if (!league) {
      return res.status(404).json({ error: 'League not found' })
    }
    res.json(league)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch schedule' })
  }
}

export const processPromotionRelegation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ error: 'League ID is required' })
    }
    const result = await leagueService.processPromotionRelegation(id)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to process promotion/relegation' })
  }
}
