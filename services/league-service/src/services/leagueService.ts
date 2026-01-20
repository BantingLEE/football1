import { League, ILeague, IScheduleRound } from '../models/League'
import { getCacheInvalidation } from 'football-manager-shared'

const cache = getCacheInvalidation()

interface CreateLeagueInput {
  name: string
  country: string
  season: {
    start: Date
    end: Date
  }
  clubs: string[]
  rules?: {
    promotionSlots?: number
    relegationSlots?: number
    points?: {
      win?: number
      draw?: number
      loss?: number
    }
  }
  history?: any[]
  isActive?: boolean
}

interface MatchResult {
  leagueId: string
  homeClubId: string
  awayClubId: string
  homeGoals: number
  awayGoals: number
}

interface PromotionRelegationResult {
  promoted: Array<{ clubId: string; position: number; points: number }>
  relegated: Array<{ clubId: string; position: number; points: number }>
}

export class LeagueService {
  async getLeagues(): Promise<ILeague[]> {
    try {
      const cacheKey = 'leagues:all'
      const cached = await cache.getJson<ILeague[]>(cacheKey)
      if (cached) return cached

      const leagues = await League.find().exec()
      await cache.setJson(cacheKey, leagues, 300)
      return leagues
    } catch (error) {
      throw new Error(`Failed to fetch leagues: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async createLeague(leagueData: CreateLeagueInput): Promise<ILeague> {
    try {
      if (!leagueData.name || !leagueData.country || !leagueData.season) {
        throw new Error('Name, country, and season are required')
      }

      if (!leagueData.clubs || leagueData.clubs.length < 2) {
        throw new Error('At least two clubs are required to create a league')
      }

      if (leagueData.season.start >= leagueData.season.end) {
        throw new Error('Season start date must be before end date')
      }

      const rules = leagueData.rules || {
        promotionSlots: 3,
        relegationSlots: 3,
        points: {
          win: 3,
          draw: 1,
          loss: 0
        }
      }

      if (rules.promotionSlots !== undefined && rules.promotionSlots < 0) {
        throw new Error('Promotion slots cannot be negative')
      }

      if (rules.relegationSlots !== undefined && rules.relegationSlots < 0) {
        throw new Error('Relegation slots cannot be negative')
      }

      if (rules.points?.win !== undefined && rules.points.win < 0) {
        throw new Error('Win points cannot be negative')
      }

      if (rules.points?.draw !== undefined && rules.points.draw < 0) {
        throw new Error('Draw points cannot be negative')
      }

      if (rules.points?.loss !== undefined && rules.points.loss < 0) {
        throw new Error('Loss points cannot be negative')
      }

      const totalSlots = (rules.promotionSlots || 0) + (rules.relegationSlots || 0)
      if (totalSlots > leagueData.clubs.length) {
        throw new Error('Promotion and relegation slots combined cannot exceed total number of clubs')
      }

      const standings = leagueData.clubs.map((clubId: string) => ({
        clubId,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0
      }))

      const newLeague = await League.create({
        ...leagueData,
        rules,
        standings,
        schedule: [],
        history: leagueData.history || [],
        isActive: leagueData.isActive !== undefined ? leagueData.isActive : true
      })

      return newLeague
    } catch (error) {
      throw new Error(`Failed to create league: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updateLeague(leagueId: string, updateData: Partial<CreateLeagueInput>): Promise<ILeague | null> {
    try {
      if (!leagueId) {
        throw new Error('League ID is required')
      }

      const league = await League.findById(leagueId).exec()
      if (!league) {
        throw new Error('League not found')
      }

      if (updateData.season && updateData.season.start && updateData.season.end) {
        if (updateData.season.start >= updateData.season.end) {
          throw new Error('Season start date must be before end date')
        }
      }

      if (updateData.rules?.promotionSlots !== undefined && updateData.rules.promotionSlots < 0) {
        throw new Error('Promotion slots cannot be negative')
      }

      if (updateData.rules?.relegationSlots !== undefined && updateData.rules.relegationSlots < 0) {
        throw new Error('Relegation slots cannot be negative')
      }

      if (updateData.rules?.points?.win !== undefined && updateData.rules.points.win < 0) {
        throw new Error('Win points cannot be negative')
      }

      if (updateData.rules?.points?.draw !== undefined && updateData.rules.points.draw < 0) {
        throw new Error('Draw points cannot be negative')
      }

      if (updateData.rules?.points?.loss !== undefined && updateData.rules.points.loss < 0) {
        throw new Error('Loss points cannot be negative')
      }

      const currentClubs = league.clubs.length
      const newClubs = updateData.clubs?.length || currentClubs
      const currentRules = league.rules
      const newRules = updateData.rules || currentRules

      const promotionSlots = newRules.promotionSlots !== undefined ? newRules.promotionSlots : currentRules.promotionSlots
      const relegationSlots = newRules.relegationSlots !== undefined ? newRules.relegationSlots : currentRules.relegationSlots

      if ((promotionSlots + relegationSlots) > newClubs) {
        throw new Error('Promotion and relegation slots combined cannot exceed total number of clubs')
      }

      Object.assign(league, updateData)
      await league.save()

      return league
    } catch (error) {
      throw new Error(`Failed to update league: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deleteLeague(leagueId: string): Promise<boolean> {
    try {
      if (!leagueId) {
        throw new Error('League ID is required')
      }

      const league = await League.findById(leagueId).exec()
      if (!league) {
        throw new Error('League not found')
      }

      await League.findByIdAndDelete(leagueId).exec()

      return true
    } catch (error) {
      throw new Error(`Failed to delete league: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async generateSchedule(leagueId: string): Promise<ILeague | null> {
    try {
      if (!leagueId) {
        throw new Error('League ID is required')
      }

      const league = await League.findById(leagueId).exec()
      if (!league) {
        throw new Error('League not found')
      }

      if (!league.clubs || league.clubs.length < 2) {
        throw new Error('No clubs assigned to league or insufficient number of clubs')
      }

      const clubs: string[] = league.clubs.map(club => club.toString())
      const schedule = this.generateRoundRobinSchedule(clubs)

      league.schedule = schedule
      await league.save()

      return league
    } catch (error) {
      throw new Error(`Failed to generate schedule: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updateStandings(matchResult: MatchResult): Promise<ILeague | null> {
    try {
      if (!matchResult.leagueId || !matchResult.homeClubId || !matchResult.awayClubId) {
        throw new Error('League ID, home club ID, and away club ID are required')
      }

      if (typeof matchResult.homeGoals !== 'number' || typeof matchResult.awayGoals !== 'number') {
        throw new Error('Home goals and away goals must be numbers')
      }

      if (matchResult.homeGoals < 0 || matchResult.awayGoals < 0) {
        throw new Error('Goals cannot be negative')
      }

      const league = await League.findById(matchResult.leagueId).exec()
      if (!league) {
        throw new Error('League not found')
      }

      const homeStanding = league.standings.find(s => s.clubId.toString() === matchResult.homeClubId)
      const awayStanding = league.standings.find(s => s.clubId.toString() === matchResult.awayClubId)

      if (!homeStanding) {
        throw new Error('Home club not found in standings')
      }
      if (!awayStanding) {
        throw new Error('Away club not found in standings')
      }

      homeStanding.played++
      awayStanding.played++
      homeStanding.goalsFor += matchResult.homeGoals
      homeStanding.goalsAgainst += matchResult.awayGoals
      awayStanding.goalsFor += matchResult.awayGoals
      awayStanding.goalsAgainst += matchResult.homeGoals

      const points = league.rules.points

      if (matchResult.homeGoals > matchResult.awayGoals) {
        homeStanding.won++
        homeStanding.points += points.win
        awayStanding.lost++
        awayStanding.points += points.loss
      } else if (matchResult.awayGoals > matchResult.homeGoals) {
        awayStanding.won++
        awayStanding.points += points.win
        homeStanding.lost++
        homeStanding.points += points.loss
      } else {
        homeStanding.drawn++
        awayStanding.drawn++
        homeStanding.points += points.draw
        awayStanding.points += points.draw
      }

      this.sortStandings(league)

      await league.save()
      await cache.invalidateLeague(matchResult.leagueId)
      return league
    } catch (error) {
      throw new Error(`Failed to update standings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getStandings(leagueId: string): Promise<ILeague | null> {
    try {
      if (!leagueId) {
        throw new Error('League ID is required')
      }

      const cacheKey = `league:${leagueId}:standings`
      const cached = await cache.getJson<ILeague>(cacheKey)
      if (cached) return cached

      const league = await League.findById(leagueId).exec()
      if (!league) {
        throw new Error('League not found')
      }

      this.sortStandings(league)

      await cache.setJson(cacheKey, league, 180)
      return league
    } catch (error) {
      throw new Error(`Failed to fetch standings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getSchedule(leagueId: string, clubId?: string): Promise<ILeague | null> {
    try {
      if (!leagueId) {
        throw new Error('League ID is required')
      }

      const cacheKey = clubId 
        ? `league:${leagueId}:schedule:club:${clubId}`
        : `league:${leagueId}:schedule`
      const cached = await cache.getJson<ILeague>(cacheKey)
      if (cached) return cached

      const league = await League.findById(leagueId).exec()
      if (!league) {
        throw new Error('League not found')
      }

      if (clubId) {
        const filteredSchedule = league.schedule.map(round => ({
          round: round.round,
          matches: round.matches.filter(match => 
            match.homeClubId.toString() === clubId || match.awayClubId.toString() === clubId
          )
        })).filter(round => round.matches.length > 0)

        league.schedule = filteredSchedule
      }

      await cache.setJson(cacheKey, league, 600)
      return league
    } catch (error) {
      throw new Error(`Failed to fetch schedule: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async processPromotionRelegation(leagueId: string): Promise<PromotionRelegationResult> {
    try {
      if (!leagueId) {
        throw new Error('League ID is required')
      }

      const league = await League.findById(leagueId).exec()
      if (!league) {
        throw new Error('League not found')
      }

      this.sortStandings(league)

      const { promotionSlots, relegationSlots } = league.rules
      const totalClubs = league.standings.length

      if (promotionSlots > totalClubs) {
        throw new Error('Promotion slots cannot exceed total number of clubs')
      }

      if (relegationSlots > totalClubs) {
        throw new Error('Relegation slots cannot exceed total number of clubs')
      }

      if (promotionSlots + relegationSlots > totalClubs) {
        throw new Error('Promotion and relegation slots combined cannot exceed total number of clubs')
      }

      const promoted: Array<{ clubId: string; position: number; points: number }> = league.standings
        .slice(0, promotionSlots)
        .map((standing, index) => ({
          clubId: standing.clubId.toString(),
          position: index + 1,
          points: standing.points
        }))

      const relegated: Array<{ clubId: string; position: number; points: number }> = league.standings
        .slice(-relegationSlots)
        .reverse()
        .map((standing, index) => ({
          clubId: standing.clubId.toString(),
          position: totalClubs - index,
          points: standing.points
        }))

      return { promoted, relegated }
    } catch (error) {
      throw new Error(`Failed to process promotion/relegation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private sortStandings(league: ILeague): void {
    league.standings.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points
      }

      const goalDifferenceA = a.goalsFor - a.goalsAgainst
      const goalDifferenceB = b.goalsFor - b.goalsAgainst

      if (goalDifferenceB !== goalDifferenceA) {
        return goalDifferenceB - goalDifferenceA
      }

      return b.goalsFor - a.goalsFor
    })
  }

  private generateRoundRobinSchedule(clubs: string[]): IScheduleRound[] {
    const schedule: IScheduleRound[] = []
    const numTeams = clubs.length
    const totalRounds = numTeams - 1
    const matchesPerRound = numTeams / 2

    const teams: (string | null)[] = [...clubs]

    if (teams.length % 2 !== 0) {
      teams.push(null)
    }

    for (let round = 0; round < totalRounds * 2; round++) {
      const roundMatches = []

      for (let match = 0; match < matchesPerRound; match++) {
        const home = teams[match]
        const away = teams[teams.length - 1 - match]

        if (home && away) {
          const isSecondHalf = round >= totalRounds
          roundMatches.push({
            homeClubId: isSecondHalf ? away : home,
            awayClubId: isSecondHalf ? home : away,
            homeGoals: undefined,
            awayGoals: undefined,
            played: false
          })
        }
      }

      schedule.push({
        round: round + 1,
        matches: roundMatches
      })

      const lastTeam = teams.pop()
      if (lastTeam !== undefined) {
        teams.splice(1, 0, lastTeam)
      }
    }

    return schedule
  }
}
