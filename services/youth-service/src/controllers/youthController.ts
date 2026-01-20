import { Request, Response } from 'express'
import { YouthService } from '../services/youthService'
import { upgradeFacilitySchema, trainYouthPlayerSchema } from '../validators/youthValidator'

const youthService = new YouthService()

export const generateYouthPlayers = async (req: Request, res: Response) => {
  try {
    const { clubId } = req.params
    if (!clubId) {
      return res.status(400).json({ error: 'Club ID is required' })
    }

    const players = await youthService.generateYouthPlayers(clubId)
    res.status(201).json(players)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate youth players' })
  }
}

export const upgradeFacility = async (req: Request, res: Response) => {
  try {
    const { clubId } = req.params
    if (!clubId) {
      return res.status(400).json({ error: 'Club ID is required' })
    }

    const { error, value } = upgradeFacilitySchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const facility = await youthService.upgradeFacility(clubId, value.targetLevel)
    if (!facility) {
      return res.status(404).json({ error: 'Youth facility not found' })
    }
    res.json(facility)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to upgrade facility' })
  }
}

export const getYouthPlayers = async (req: Request, res: Response) => {
  try {
    const { clubId } = req.params
    if (!clubId) {
      return res.status(400).json({ error: 'Club ID is required' })
    }

    const players = await youthService.getYouthPlayers(clubId)
    res.json(players)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch youth players' })
  }
}

export const promoteToFirstTeam = async (req: Request, res: Response) => {
  try {
    const { playerId } = req.params
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID is required' })
    }

    const player = await youthService.promoteToFirstTeam(playerId)
    if (!player) {
      return res.status(404).json({ error: 'Player not found' })
    }
    res.json(player)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to promote player' })
  }
}

export const trainYouthPlayer = async (req: Request, res: Response) => {
  try {
    const { playerId } = req.params
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID is required' })
    }

    const { error, value } = trainYouthPlayerSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const player = await youthService.trainYouthPlayer(playerId, value.trainingType, value.duration)
    if (!player) {
      return res.status(404).json({ error: 'Player not found' })
    }
    res.json(player)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to train youth player' })
  }
}

export const retireOldPlayers = async (req: Request, res: Response) => {
  try {
    const retiredPlayers = await youthService.retireOldPlayers()
    res.json({ retired: retiredPlayers.length, players: retiredPlayers })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to retire players' })
  }
}

export const getFacilityCapacity = async (req: Request, res: Response) => {
  try {
    const { level } = req.params
    const capacity = youthService['calculateFacilityCapacity'](parseInt(level))
    res.json({ level: parseInt(level), capacity })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get facility capacity' })
  }
}
