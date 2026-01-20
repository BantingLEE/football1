import { Request, Response } from 'express'
import { PlayerService } from '../services/playerService'

const playerService = new PlayerService()

export const getAllPlayers = async (req: Request, res: Response) => {
  try {
    const players = await playerService.getAllPlayers()
    res.json(players)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players' })
  }
}

export const getPlayerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const player = await playerService.getPlayerById(id)
    if (!player) {
      return res.status(404).json({ error: 'Player not found' })
    }
    res.json(player)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player' })
  }
}

export const getPlayersByClub = async (req: Request, res: Response) => {
  try {
    const { clubId } = req.params
    const players = await playerService.getPlayersByClub(clubId)
    res.json(players)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players' })
  }
}

export const createPlayer = async (req: Request, res: Response) => {
  try {
    const player = await playerService.createPlayer(req.body)
    res.status(201).json(player)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create player' })
  }
}

export const updatePlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const player = await playerService.updatePlayer(id, req.body)
    if (!player) {
      return res.status(404).json({ error: 'Player not found' })
    }
    res.json(player)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update player' })
  }
}

export const deletePlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const player = await playerService.deletePlayer(id)
    if (!player) {
      return res.status(404).json({ error: 'Player not found' })
    }
    res.json({ message: 'Player deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete player' })
  }
}

export const transferPlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { toClubId } = req.body
    const player = await playerService.transferPlayer(id, req.body.fromClubId, toClubId)
    if (!player) {
      return res.status(404).json({ error: 'Player not found' })
    }
    res.json(player)
  } catch (error) {
    res.status(500).json({ error: 'Failed to transfer player' })
  }
}

export const trainPlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { trainingType } = req.body
    const player = await playerService.trainPlayer(id, trainingType)
    if (!player) {
      return res.status(404).json({ error: 'Player not found' })
    }
    res.json(player)
  } catch (error) {
    res.status(500).json({ error: 'Failed to train player' })
  }
}