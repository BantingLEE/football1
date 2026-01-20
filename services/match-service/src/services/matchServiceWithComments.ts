import { Match, IMatch } from '../models/Match'
import { MatchSimulation } from './matchSimulation'
import { MatchNotFoundError, InvalidMatchIdError } from '../errors/matchErrors'

export class MatchService {
  async getAllMatches(): Promise<IMatch[]> {
    const matches = await Match.find().exec()
    return matches
  }

  async getMatchById(id: string): Promise<IMatch | null> {
    const match = await Match.findById(id).exec()
    return match
  }

  async getMatchesByLeague(leagueId: string): Promise<IMatch[]> {
    const matches = await Match.find({ leagueId }).sort({ date: 1 }).exec()
    return matches
  }

  async createMatch(matchData: Partial<IMatch>): Promise<IMatch> {
    const match = await Match.create(matchData)
    return match
  }

  async startMatch(id: string, socketIo: { emit: (event: string, data: unknown) => void } | null): Promise<IMatch> {
    const match = await Match.findById(id).exec()
    if (!match) {
      throw new MatchNotFoundError()
    }

    match.status = 'live'
    await match.save()

    const simulation = new MatchSimulation(match)
    await simulation.simulateRealtime(this.simulateMinute.bind(this), socketIo)

    match.status = 'completed'
    await match.save()

    return match
  }

  async simulateMatch(id: string): Promise<IMatch> {
    const match = await Match.findById(id).exec()
    if (!match) {
      throw new MatchNotFoundError()
    }

    const simulation = new MatchSimulation(match)
    return await simulation.simulate()
  }

  private async simulateMinute(match: IMatch, socketIo: { emit: (event: string, data: unknown) => void } | null): Promise<void> {
    const homeStrength = 70
    const awayStrength = 65

    if (Math.random() < 0.2) {
      const event = {
        minute: match.events.length + 1,
        type: 'shot',
        teamId: Math.random() < 0.5 ? match.homeTeam.clubId : match.awayTeam.clubId,
        description: 'Shot attempt'
      }
      match.events.push(event)

      if (socketIo) {
        socketIo.emit('match:event', { matchId: match._id, event })
      }
    }
  }

  async updateMatch(id: string, matchData: Partial<IMatch>): Promise<IMatch | null> {
    const match = await Match.findByIdAndUpdate(id, matchData, { new: true }).exec()
    return match
  }
}
