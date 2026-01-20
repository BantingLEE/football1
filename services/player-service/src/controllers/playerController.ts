import { Request, Response } from 'express'
import { PlayerService } from '../services/playerService'
import { playerCreateSchema, playerUpdateSchema, trainingSchema, transferSchema } from '../validation/playerValidation'

const playerService = new PlayerService()

export const getAllPlayers = async (req: Request, res: Response) => {
  try {
    const players = await playerService.getAllPlayers()
    res.json(players)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch players' })
  }
}

export const getPlayerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ error: 'Player ID is required' })
    }
    const player = await playerService.getPlayerById(id)
    if (!player) {
      return res.status(404).json({ error: 'Player not found' })
    }
    res.json(player)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch player' })
  }
}

export const getPlayersByClub = async (req: Request, res: Response) => {
  try {
    const { clubId } = req.params
    if (!clubId) {
      return res.status(400).json({ error: 'Club ID is required' })
    }
    const players = await playerService.getPlayersByClub(clubId)
    res.json(players)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch players' })
  }
}

export const createPlayer = async (req: Request, res: Response) => {
  try {
    const { error, value } = playerCreateSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }
    const player = await playerService.createPlayer(value)
    res.status(201).json(player)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create player' })
  }
}

export const updatePlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ error: 'Player ID is required' })
    }

    const { error, value } = playerUpdateSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const player = await playerService.updatePlayer(id, value)
    if (!player) {
      return res.status(404).json({ error: 'Player not found' })
    }
    res.json(player)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update player' })
  }
}

export const deletePlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ error: 'Player ID is required' })
    }
    const player = await playerService.deletePlayer(id)
    if (!player) {
      return res.status(404).json({ error: 'Player not found' })
    }
    res.json({ message: 'Player deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete player' })
  }
}

export const transferPlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ error: 'Player ID is required' })
    }

    const { error, value } = transferSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const player = await playerService.transferPlayer(id, value.fromClubId, value.toClubId)
    if (!player) {
      return res.status(404).json({ error: 'Player not found' })
    }
    res.json(player)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to transfer player' })
  }
}

export const trainPlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ error: 'Player ID is required' })
    }

    const { error, value } = trainingSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const player = await playerService.trainPlayer(id, value.trainingType)
    if (!player) {
      return res.status(404).json({ error: 'Player not found' })
    }
    res.json(player)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to train player' })
  }
}