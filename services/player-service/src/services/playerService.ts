import { Player, IPlayer } from '../models/Player'

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export class PlayerService {
  async getAllPlayers(): Promise<IPlayer[]> {
    const players = await Player.find().exec()
    return players
  }

  async getPlayerById(id: string): Promise<IPlayer | null> {
    const player = await Player.findById(id).exec()
    return player
  }

  async getPlayersByClub(clubId: string): Promise<IPlayer[]> {
    const players = await Player.find({ clubId }).exec()
    return players
  }

  async createPlayer(playerData: Partial<IPlayer>): Promise<IPlayer> {
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

    return newPlayer
  }

  async updatePlayer(id: string, playerData: Partial<IPlayer>): Promise<IPlayer | null> {
    const player = await Player.findByIdAndUpdate(id, playerData, { new: true }).exec()
    return player
  }

  async deletePlayer(id: string): Promise<IPlayer | null> {
    const player = await Player.findByIdAndDelete(id).exec()
    return player
  }

  async transferPlayer(playerId: string, fromClubId: string, toClubId: string): Promise<IPlayer | null> {
    const player = await Player.findById(playerId).exec()
    if (!player) return null

    player.clubId = toClubId as any
    await player.save()

    return player
  }

  calculatePlayerValue(player: IPlayer): number {
    const ageFactor = player.age < 24 ? 1.2 : player.age > 30 ? 0.6 : 1
    const potentialFactor = player.potential / 100
    return Math.round(player.currentAbility * 10000 * ageFactor * potentialFactor)
  }

  async trainPlayer(playerId: string, trainingType: string): Promise<IPlayer | null> {
    const player = await Player.findById(playerId).exec()
    if (!player) return null

    const growthAmount = this.calculateGrowth(player, trainingType)
    this.applyGrowth(player, growthAmount, trainingType)

    await player.save()
    return player
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