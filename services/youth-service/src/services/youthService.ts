import { Player, IPlayer } from '../models/Player'
import { YouthFacility } from '../models/YouthFacility'
import { YOUTH_FACILITY_LEVELS, PLAYER_AGE_GROUPS } from 'football-manager-shared'

const POSITIONS = ['GK', 'CB', 'RB', 'LB', 'CDM', 'CM', 'CAM', 'RM', 'LM', 'ST', 'CF', 'LW', 'RW']

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export class YouthService {
  async generateYouthPlayers(clubId: string): Promise<IPlayer[]> {
    try {
      if (!clubId || !/^[0-9a-fA-F]{24}$/.test(clubId)) {
        throw new Error('Club ID is required')
      }

      const facility = await YouthFacility.findOne({ clubId })
      if (!facility) {
        throw new Error('Youth facility not found for club')
      }

      const capacity = this.calculateFacilityCapacity(facility.level)
      const existingYouthPlayers = await Player.find({ clubId, isYouth: true }).exec()
      const availableSlots = capacity - existingYouthPlayers.length

      if (availableSlots <= 0) {
        return []
      }

      const newPlayersCount = Math.min(availableSlots, YOUTH_FACILITY_LEVELS[facility.level].newPlayersPerWeek)
      const newPlayers: IPlayer[] = []

      for (let i = 0; i < newPlayersCount; i++) {
        const age = randomBetween(PLAYER_AGE_GROUPS.YOUTH.min, PLAYER_AGE_GROUPS.YOUTH.max)
        const qualityMultiplier = YOUTH_FACILITY_LEVELS[facility.level].quality

        const baseAttribute = Math.floor(40 * qualityMultiplier)
        const attributeVariance = Math.floor(30 * qualityMultiplier)

        const attributes = {
          speed: randomBetween(baseAttribute, baseAttribute + attributeVariance),
          shooting: randomBetween(baseAttribute, baseAttribute + attributeVariance),
          passing: randomBetween(baseAttribute, baseAttribute + attributeVariance),
          defending: randomBetween(baseAttribute, baseAttribute + attributeVariance),
          physical: randomBetween(baseAttribute, baseAttribute + attributeVariance),
          technical: randomBetween(baseAttribute, baseAttribute + attributeVariance),
          mental: randomBetween(baseAttribute, baseAttribute + attributeVariance)
        }

        const currentAbility = Math.round(
          Object.values(attributes).reduce((sum, val) => sum + val, 0) /
          Object.keys(attributes).length
        )

        const potential = Math.min(99, Math.round(currentAbility + randomBetween(10, 30)))

        const newPlayer = await Player.create({
          name: `Youth Player ${randomBetween(1, 9999)}`,
          age,
          nationality: 'Unknown',
          height: randomBetween(165, 195),
          weight: randomBetween(60, 90),
          position: POSITIONS[randomBetween(0, POSITIONS.length - 1)],
          attributes,
          potential,
          currentAbility,
          contract: {
            salary: 0,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            bonus: 0
          },
          history: {
            matchesPlayed: 0,
            goals: 0,
            assists: 0,
            growthLog: []
          },
          clubId,
          isYouth: true
        })

        newPlayers.push(newPlayer)
      }

      facility.lastGenerationDate = new Date()
      await facility.save()

      return newPlayers
    } catch (error) {
      throw new Error(`Failed to generate youth players: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async upgradeFacility(clubId: string, targetLevel: number): Promise<IYouthFacility> {
    try {
      if (!clubId || !/^[0-9a-fA-F]{24}$/.test(clubId)) {
        throw new Error('Club ID is required')
      }
      if (!targetLevel || targetLevel < 1) {
        throw new Error('Target level is required')
      }

      const facility = await YouthFacility.findOne({ clubId })
      if (!facility) {
        throw new Error('Youth facility not found for club')
      }

      if (targetLevel > 5) {
        throw new Error('Cannot upgrade beyond level 5')
      }

      if (targetLevel !== facility.level + 1) {
        throw new Error('Can only upgrade to next level')
      }

      facility.level = targetLevel
      if (!facility.upgradeHistory) {
        facility.upgradeHistory = []
      }
      facility.upgradeHistory.push({
        date: new Date(),
        fromLevel: targetLevel - 1,
        toLevel: targetLevel
      })

      await facility.save()
      return facility
    } catch (error) {
      throw new Error(`Failed to upgrade facility: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getYouthPlayers(clubId: string): Promise<IPlayer[]> {
    try {
      if (!clubId || !/^[0-9a-fA-F]{24}$/.test(clubId)) {
        throw new Error('Club ID is required')
      }

      const players = await Player.find({ clubId, isYouth: true }).exec()
      return players
    } catch (error) {
      throw new Error(`Failed to fetch youth players: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async promoteToFirstTeam(playerId: string): Promise<IPlayer | null> {
    try {
      if (!playerId || !/^[0-9a-fA-F]{24}$/.test(playerId)) {
        throw new Error('Player ID is required')
      }

      const player = await Player.findById(playerId).exec()
      if (!player) {
        throw new Error('Player not found')
      }

      if (!player.isYouth) {
        throw new Error('Player is not a youth player')
      }

      player.isYouth = false
      await player.save()

      return player
    } catch (error) {
      throw new Error(`Failed to promote player: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async trainYouthPlayer(playerId: string, trainingType: string, duration: number): Promise<IPlayer | null> {
    try {
      if (!playerId || !/^[0-9a-fA-F]{24}$/.test(playerId)) {
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

      if (!player.isYouth) {
        throw new Error('Player is not a youth player')
      }

      const growthAmount = this.calculateYouthGrowth(player, duration, trainingType)
      this.applyGrowth(player, growthAmount, trainingType)

      await player.save()
      return player
    } catch (error) {
      throw new Error(`Failed to train youth player: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async retireOldPlayers(): Promise<IPlayer[]> {
    try {
      const retirementAge = PLAYER_AGE_GROUPS.RETIREMENT.min
      const playersToRetire = await Player.find({
        age: { $gte: retirementAge },
        isYouth: false
      }).exec()

      const retiredPlayers: IPlayer[] = []

      for (const player of playersToRetire) {
        const deleted = await Player.findByIdAndDelete(player._id).exec()
        if (deleted) {
          retiredPlayers.push(deleted)
        }
      }

      return retiredPlayers
    } catch (error) {
      throw new Error(`Failed to retire players: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  calculateFacilityCapacity(level: number): number {
    if (!level || level < 1 || level > 5) {
      throw new Error('Invalid facility level')
    }
    return YOUTH_FACILITY_LEVELS[level].capacity
  }

  private calculateYouthGrowth(player: IPlayer, duration: number, trainingType: string): number {
    let growthRate = 0

    if (player.age >= PLAYER_AGE_GROUPS.YOUTH.min && player.age <= PLAYER_AGE_GROUPS.YOUTH.max) {
      growthRate = 3.0
    } else if (player.age >= PLAYER_AGE_GROUPS.PRIME.min && player.age <= PLAYER_AGE_GROUPS.PRIME.max) {
      growthRate = 0.8
    } else {
      growthRate = -0.2
    }

    growthRate *= (duration / 7)

    if (player.injury?.isInjured) {
      growthRate *= 0.3
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

interface IYouthFacilityUpgrade {
  date: Date
  fromLevel: number
  toLevel: number
}

interface IYouthFacility {
  _id: string
  clubId: string
  level: number
  lastGenerationDate: Date
  upgradeHistory: IYouthFacilityUpgrade[]
}
