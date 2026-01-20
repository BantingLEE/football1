import { Player, IPlayer } from '../models/Player'
import { ClientSession } from 'mongoose'
import { getCacheInvalidation } from 'football-manager-shared'

const cache = getCacheInvalidation()

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export class PlayerService {
  async getAllPlayers(): Promise<IPlayer[]> {
    try {
      const cacheKey = 'players:all'
      const cached = await cache.getJson<IPlayer[]>(cacheKey)
      if (cached) return cached

      const players = await Player.find().exec()
      await cache.setJson(cacheKey, players, 300)
      return players
    } catch (error) {
      throw new Error(`Failed to fetch players: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getPlayerById(id: string): Promise<IPlayer | null> {
    try {
      if (!id) {
        throw new Error('Player ID is required')
      }
      const cacheKey = `player:${id}`
      const cached = await cache.getJson<IPlayer>(cacheKey)
      if (cached) return cached

      const player = await Player.findById(id).exec()
      if (player) {
        await cache.setJson(cacheKey, player, 600)
      }
      return player
    } catch (error) {
      throw new Error(`Failed to fetch player: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getPlayersByClub(clubId: string): Promise<IPlayer[]> {
    try {
      if (!clubId) {
        throw new Error('Club ID is required')
      }
      const cacheKey = `players:club:${clubId}`
      const cached = await cache.getJson<IPlayer[]>(cacheKey)
      if (cached) return cached

      const players = await Player.find({ clubId }).exec()
      await cache.setJson(cacheKey, players, 300)
      return players
    } catch (error) {
      throw new Error(`Failed to fetch players: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async createPlayer(playerData: Partial<IPlayer>): Promise<IPlayer> {
    try {
      if (!playerData.name || !playerData.age || !playerData.position) {
        throw new Error('Name, age, and position are required')
      }

      const newPlayer = await Player.create({
        ...playerData,
        attributes: playerData.attributes || this.generateRandomAttributes(),
        potential: playerData.potential || randomBetween(50, 99),
        currentAbility: playerData.currentAbility || randomBetween(40, 85),
        history: {
          matchesPlayed: 0,
          goals: 0,
          assists: 0,
          growthLog: []
        }
      })

      if (newPlayer.clubId) {
        await cache.invalidateClub(newPlayer.clubId.toString())
      }

      return newPlayer
    } catch (error) {
      throw new Error(`Failed to create player: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updatePlayer(id: string, playerData: Partial<IPlayer>): Promise<IPlayer | null> {
    try {
      if (!id) {
        throw new Error('Player ID is required')
      }
      const player = await Player.findByIdAndUpdate(id, playerData, { new: true }).exec()
      if (player) {
        await cache.invalidatePlayer(id)
        if (player.clubId) {
          await cache.invalidateClub(player.clubId.toString())
        }
      }
      return player
    } catch (error) {
      throw new Error(`Failed to update player: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deletePlayer(id: string): Promise<IPlayer | null> {
    try {
      if (!id) {
        throw new Error('Player ID is required')
      }
      const player = await Player.findByIdAndDelete(id).exec()
      if (player) {
        await cache.invalidatePlayer(id)
        if (player.clubId) {
          await cache.invalidateClub(player.clubId.toString())
        }
      }
      return player
    } catch (error) {
      throw new Error(`Failed to delete player: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async transferPlayer(playerId: string, fromClubId: string, toClubId: string, session?: ClientSession): Promise<IPlayer | null> {
    try {
      if (!playerId || !fromClubId || !toClubId) {
        throw new Error('Player ID, fromClubId, and toClubId are required')
      }

      if (fromClubId === toClubId) {
        throw new Error('Cannot transfer player to the same club')
      }

      const player = await Player.findById(playerId).session(session || null).exec()
      if (!player) {
        throw new Error('Player not found')
      }

      if (player.clubId?.toString() !== fromClubId) {
        throw new Error('Player does not belong to the specified fromClubId')
      }

      player.clubId = toClubId as any
      await player.save({ session })

      await Promise.all([
        cache.invalidatePlayer(playerId),
        cache.invalidateClub(fromClubId),
        cache.invalidateClub(toClubId)
      ])

      return player
    } catch (error) {
      throw new Error(`Failed to transfer player: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  calculatePlayerValue(player: IPlayer): number {
    const ageFactor = player.age < 24 ? 1.2 : player.age > 30 ? 0.6 : 1
    const potentialFactor = player.potential / 100
    return Math.round(player.currentAbility * 10000 * ageFactor * potentialFactor)
  }

  async trainPlayer(playerId: string, trainingType: string): Promise<IPlayer | null> {
    try {
      if (!playerId) {
        throw new Error('Player ID is required')
      }
      if (!trainingType) {
        throw new Error('Training type is required')
      }

      const validTrainingTypes = ['technical', 'physical', 'tactical', 'goalkeeping']
      if (!validTrainingTypes.includes(trainingType)) {
        throw new Error(`Invalid training type. Must be one of: ${validTrainingTypes.join(', ')}`)
      }

      const player = await Player.findById(playerId).exec()
      if (!player) {
        throw new Error('Player not found')
      }

      const growthAmount = this.calculateGrowth(player, trainingType)
      this.applyGrowth(player, growthAmount, trainingType)

      await player.save()
      return player
    } catch (error) {
      throw new Error(`Failed to train player: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private generateRandomAttributes() {
    return {
      speed: randomBetween(40, 90),
      shooting: randomBetween(40, 90),
      passing: randomBetween(40, 90),
      defending: randomBetween(40, 90),
      physical: randomBetween(40, 90),
      technical: randomBetween(40, 90),
      mental: randomBetween(40, 90)
    }
  }

  private calculateGrowth(player: IPlayer, trainingType: string): number {
    let growthRate = 0

    if (player.age >= 16 && player.age <= 22) {
      growthRate = 2.0
    } else if (player.age >= 23 && player.age <= 28) {
      growthRate = 0.5
    } else if (player.age > 28) {
      growthRate = -0.3
    }

    if (player.injury?.isInjured) {
      growthRate *= 0.5
    }

    return growthRate
  }

  private applyGrowth(player: IPlayer, growthAmount: number, trainingType: string): void {
    const trainingAttributes = this.getTrainingAttributes(trainingType)

    trainingAttributes.forEach(attr => {
      const currentValue = player.attributes[attr as keyof typeof player.attributes] || 50
      const newValue = Math.max(0, Math.min(99, currentValue + growthAmount))
      player.attributes[attr as keyof typeof player.attributes] = newValue
    })

    player.currentAbility = Math.round(
      Object.values(player.attributes).reduce((sum, val) => sum + val, 0) /
      Object.keys(player.attributes).length
    )

    player.history.growthLog.push({
      date: new Date(),
      attributes: player.attributes,
      currentAbility: player.currentAbility
    })
  }

  private getTrainingAttributes(trainingType: string): string[] {
    const trainingMap: { [key: string]: string[] } = {
      technical: ['technical', 'passing', 'shooting'],
      physical: ['physical', 'speed'],
      tactical: ['mental', 'defending'],
      goalkeeping: ['goalkeeping']
    }

    return trainingMap[trainingType] || ['technical', 'physical', 'mental']
  }
}