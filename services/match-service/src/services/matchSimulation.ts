import { IMatch, MatchEvent } from '../models/Match'
import { SIMULATION_CONSTANTS } from '../constants/simulationConstants'

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export class MatchSimulation {
  private match: IMatch
  private currentMinute: number = 0
  private events: MatchEvent[] = []
  private possessionSum: { home: number; away: number } = { home: 0, away: 0 }

  constructor(match: IMatch) {
    this.match = match
  }

  async simulate(): Promise<IMatch> {
    this.currentMinute = 0
    this.match.status = 'live'
    this.possessionSum = { home: 0, away: 0 }

    for (let minute = 1; minute <= SIMULATION_CONSTANTS.MATCH.DURATION; minute++) {
      this.currentMinute = minute
      await this.simulateMinute()
    }

    this.match.status = 'completed'
    this.match.events = this.events

    return this.match
  }

  async simulateRealtime(
    simulateMinuteCallback: (match: IMatch, socketIo: unknown) => Promise<void>,
    socketIo: unknown
  ): Promise<void> {
    this.currentMinute = 0
    this.possessionSum = { home: 0, away: 0 }

    const promises: Promise<void>[] = []

    for (let minute = 1; minute <= SIMULATION_CONSTANTS.MATCH.DURATION; minute++) {
      this.currentMinute = minute
      const minutePromise = this.simulateMinute().then(async () => {
        await simulateMinuteCallback(this.match, socketIo)
        await new Promise(resolve => setTimeout(resolve, 1000))
      })
      promises.push(minutePromise)
    }

    await Promise.all(promises)
  }

  async simulateMinute(): Promise<void> {
    const homeStrength = this.calculateTeamStrength(this.match.homeTeam)
    const awayStrength = this.calculateTeamStrength(this.match.awayTeam)

    const possession = homeStrength / (homeStrength + awayStrength)

    if (Math.random() < SIMULATION_CONSTANTS.MATCH.EVENT_PROBABILITY) {
      await this.generateEvent(possession)
    }

    this.updateStatistics(possession)
  }

  private calculateTeamStrength(team: IMatch['homeTeam']): number {
    return randomBetween(SIMULATION_CONSTANTS.TEAM_STRENGTH.MIN, SIMULATION_CONSTANTS.TEAM_STRENGTH.MAX)
  }

  private async generateEvent(possession: number): Promise<void> {
    const eventTypes = ['shot', 'foul', 'corner']
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]

    const event: MatchEvent = {
      minute: this.currentMinute,
      type: eventType,
      teamId: Math.random() < possession ? this.match.homeTeam.clubId : this.match.awayTeam.clubId,
      description: `${eventType} at minute ${this.currentMinute}`
    }

    if (eventType === 'shot') {
      const isGoal = Math.random() < SIMULATION_CONSTANTS.MATCH.GOAL_PROBABILITY
      if (isGoal) {
        event.type = 'goal'
        event.description = `Goal at minute ${this.currentMinute}!`

        if (event.teamId === this.match.homeTeam.clubId) {
          this.match.homeTeam.score++
        } else {
          this.match.awayTeam.score++
        }
      }
    }

    this.events.push(event)
    this.match.statistics.shots.home++
    this.match.statistics.shots.away++
  }

  private updateStatistics(possession: number): void {
    this.possessionSum.home += possession
    this.possessionSum.away += (1 - possession)

    this.match.statistics.possession.home = this.possessionSum.home / this.currentMinute * 100
    this.match.statistics.possession.away = this.possessionSum.away / this.currentMinute * 100
  }
}
