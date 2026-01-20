import { Request, Response } from 'express'
import { ClubService } from '../services/clubService'

const clubService = new ClubService()

export const getAllClubs = async (req: Request, res: Response) => {
  try {
    const clubs = await clubService.getAllClubs()
    res.json(clubs)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clubs' })
  }
}

export const getClubById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const club = await clubService.getClubById(id)
    if (!club) {
      return res.status(404).json({ error: 'Club not found' })
    }
    res.json(club)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch club' })
  }
}

export const createClub = async (req: Request, res: Response) => {
  try {
    const club = await clubService.createClub(req.body)
    res.status(201).json(club)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create club' })
  }
}

export const updateClub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const club = await clubService.updateClub(id, req.body)
    if (!club) {
      return res.status(404).json({ error: 'Club not found' })
    }
    res.json(club)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update club' })
  }
}

export const deleteClub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const club = await clubService.deleteClub(id)
    if (!club) {
      return res.status(404).json({ error: 'Club not found' })
    }
    res.json({ message: 'Club deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete club' })
  }
}
