"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const leagueService_1 = require("../src/services/leagueService");
const League_1 = require("../src/models/League");
jest.mock('../src/models/League');
describe('LeagueService', () => {
    let leagueService;
    beforeEach(() => {
        leagueService = new leagueService_1.LeagueService();
        jest.clearAllMocks();
    });
    describe('getLeagues', () => {
        it('should return all leagues', async () => {
            const mockLeagues = [
                { _id: '1', name: 'Premier League', country: 'England' },
                { _id: '2', name: 'La Liga', country: 'Spain' }
            ];
            League_1.League.find = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockLeagues)
            });
            const result = await leagueService.getLeagues();
            expect(League_1.League.find).toHaveBeenCalled();
            expect(result).toEqual(mockLeagues);
        });
        it('should throw error when database query fails', async () => {
            League_1.League.find = jest.fn().mockReturnValue({
                exec: jest.fn().mockRejectedValue(new Error('Database error'))
            });
            await expect(leagueService.getLeagues()).rejects.toThrow('Failed to fetch leagues');
        });
    });
    describe('createLeague', () => {
        const leagueData = {
            name: 'Test League',
            country: 'Test Country',
            season: {
                start: new Date('2024-01-01'),
                end: new Date('2024-12-31')
            },
            clubs: ['club1', 'club2', 'club3']
        };
        it('should create a new league', async () => {
            const mockLeague = {
                _id: '1',
                ...leagueData,
                rules: {
                    promotionSlots: 3,
                    relegationSlots: 3,
                    points: {
                        win: 3,
                        draw: 1,
                        loss: 0
                    }
                },
                standings: [
                    { clubId: 'club1', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
                    { clubId: 'club2', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
                    { clubId: 'club3', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
                ],
                schedule: [],
                history: [],
                isActive: true
            };
            League_1.League.create = jest.fn().mockResolvedValue(mockLeague);
            const result = await leagueService.createLeague(leagueData);
            expect(League_1.League.create).toHaveBeenCalled();
            expect(result.name).toBe('Test League');
            expect(result.standings).toHaveLength(3);
        });
        it('should throw error when required fields are missing', async () => {
            const invalidData = { name: 'Test' };
            League_1.League.create = jest.fn().mockRejectedValue(new Error('Validation error'));
            await expect(leagueService.createLeague(invalidData)).rejects.toThrow('Failed to create league');
        });
        it('should throw error when clubs array is empty', async () => {
            await expect(leagueService.createLeague({ ...leagueData, clubs: [] })).rejects.toThrow('At least two clubs are required');
        });
    });
    describe('generateSchedule', () => {
        const mockLeague = {
            _id: '1',
            name: 'Test League',
            clubs: ['club1', 'club2', 'club3', 'club4'],
            schedule: [],
            save: jest.fn().mockResolvedValue(true)
        };
        it('should generate round-robin schedule for 4 clubs', async () => {
            League_1.League.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockLeague)
            });
            const result = await leagueService.generateSchedule('1');
            expect(League_1.League.findById).toHaveBeenCalledWith('1');
            expect(result).not.toBeNull();
            expect(result?.schedule).toBeDefined();
            expect(result?.schedule.length).toBeGreaterThan(0);
            expect(mockLeague.save).toHaveBeenCalled();
        });
        it('should throw error when league not found', async () => {
            League_1.League.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(null)
            });
            await expect(leagueService.generateSchedule('999')).rejects.toThrow('League not found');
        });
        it('should throw error when clubs are not assigned', async () => {
            const leagueWithoutClubs = {
                _id: '1',
                clubs: [],
                schedule: []
            };
            League_1.League.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(leagueWithoutClubs)
            });
            await expect(leagueService.generateSchedule('1')).rejects.toThrow('No clubs assigned to league');
        });
    });
    describe('updateStandings', () => {
        const createMockLeague = () => ({
            _id: '1',
            name: 'Test League',
            rules: {
                promotionSlots: 3,
                relegationSlots: 3,
                points: {
                    win: 3,
                    draw: 1,
                    loss: 0
                }
            },
            standings: [
                {
                    clubId: 'club1',
                    played: 0,
                    won: 0,
                    drawn: 0,
                    lost: 0,
                    goalsFor: 0,
                    goalsAgainst: 0,
                    points: 0
                },
                {
                    clubId: 'club2',
                    played: 0,
                    won: 0,
                    drawn: 0,
                    lost: 0,
                    goalsFor: 0,
                    goalsAgainst: 0,
                    points: 0
                }
            ],
            save: jest.fn().mockResolvedValue(true)
        });
        const matchResult = {
            leagueId: '1',
            homeClubId: 'club1',
            awayClubId: 'club2',
            homeGoals: 2,
            awayGoals: 1
        };
        it('should update standings after home win', async () => {
            const mockLeague = createMockLeague();
            League_1.League.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockLeague)
            });
            const result = await leagueService.updateStandings(matchResult);
            expect(League_1.League.findById).toHaveBeenCalledWith('1');
            expect(result).not.toBeNull();
            const homeStanding = result?.standings.find(s => s.clubId === 'club1');
            expect(homeStanding?.won).toBe(1);
            expect(homeStanding?.points).toBe(3);
            expect(homeStanding?.goalsFor).toBe(2);
            expect(homeStanding?.goalsAgainst).toBe(1);
            const awayStanding = result?.standings.find(s => s.clubId === 'club2');
            expect(awayStanding?.lost).toBe(1);
            expect(awayStanding?.points).toBe(0);
            expect(awayStanding?.goalsFor).toBe(1);
            expect(awayStanding?.goalsAgainst).toBe(2);
        });
        it('should handle draw', async () => {
            const mockLeague = createMockLeague();
            const drawMatch = { ...matchResult, homeGoals: 1, awayGoals: 1 };
            League_1.League.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockLeague)
            });
            const result = await leagueService.updateStandings(drawMatch);
            expect(result).not.toBeNull();
            const homeStanding = result?.standings.find(s => s.clubId === 'club1');
            const awayStanding = result?.standings.find(s => s.clubId === 'club2');
            expect(homeStanding?.drawn).toBe(1);
            expect(awayStanding?.drawn).toBe(1);
            expect(homeStanding?.points).toBe(1);
            expect(awayStanding?.points).toBe(1);
        });
        it('should throw error when league not found', async () => {
            League_1.League.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(null)
            });
            await expect(leagueService.updateStandings(matchResult)).rejects.toThrow('League not found');
        });
        it('should throw error when club not in standings', async () => {
            const mockLeague = createMockLeague();
            League_1.League.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockLeague)
            });
            await expect(leagueService.updateStandings({ ...matchResult, homeClubId: 'club999' })).rejects.toThrow('Home club not found in standings');
        });
    });
    describe('getStandings', () => {
        const mockLeague = {
            _id: '1',
            name: 'Test League',
            standings: [
                { clubId: 'club2', played: 10, won: 8, drawn: 1, lost: 1, goalsFor: 25, goalsAgainst: 5, points: 25 },
                { clubId: 'club1', played: 10, won: 7, drawn: 2, lost: 1, goalsFor: 20, goalsAgainst: 6, points: 23 }
            ]
        };
        it('should return sorted standings', async () => {
            League_1.League.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockLeague)
            });
            const result = await leagueService.getStandings('1');
            expect(League_1.League.findById).toHaveBeenCalledWith('1');
            expect(result).not.toBeNull();
            expect(result?.standings[0].points).toBeGreaterThanOrEqual(result?.standings[1]?.points ?? 0);
        });
        it('should throw error when league not found', async () => {
            League_1.League.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(null)
            });
            await expect(leagueService.getStandings('999')).rejects.toThrow('League not found');
        });
    });
    describe('getSchedule', () => {
        const mockLeague = {
            _id: '1',
            name: 'Test League',
            schedule: [
                {
                    round: 1,
                    matches: [
                        { homeClubId: 'club1', awayClubId: 'club2', played: false },
                        { homeClubId: 'club3', awayClubId: 'club4', played: false }
                    ]
                },
                {
                    round: 2,
                    matches: [
                        { homeClubId: 'club2', awayClubId: 'club1', played: true, homeGoals: 2, awayGoals: 1 }
                    ]
                }
            ]
        };
        it('should return full league schedule when clubId not provided', async () => {
            League_1.League.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockLeague)
            });
            const result = await leagueService.getSchedule('1');
            expect(League_1.League.findById).toHaveBeenCalledWith('1');
            expect(result).not.toBeNull();
            expect(result?.schedule).toHaveLength(2);
        });
        it('should return filtered schedule when clubId is provided', async () => {
            League_1.League.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockLeague)
            });
            const result = await leagueService.getSchedule('1', 'club1');
            expect(result).not.toBeNull();
            const club1Matches = result?.schedule.flatMap(round => round.matches) || [];
            club1Matches.forEach(match => {
                expect(match.homeClubId === 'club1' || match.awayClubId === 'club1').toBe(true);
            });
        });
        it('should throw error when league not found', async () => {
            League_1.League.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(null)
            });
            await expect(leagueService.getSchedule('999')).rejects.toThrow('League not found');
        });
    });
    describe('processPromotionRelegation', () => {
        const mockLeague = {
            _id: '1',
            name: 'Test League',
            rules: {
                promotionSlots: 3,
                relegationSlots: 3,
                points: { win: 3, draw: 1, loss: 0 }
            },
            standings: [
                { clubId: 'club1', played: 38, won: 30, drawn: 5, lost: 3, goalsFor: 90, goalsAgainst: 20, points: 95 },
                { clubId: 'club2', played: 38, won: 28, drawn: 6, lost: 4, goalsFor: 85, goalsAgainst: 25, points: 90 },
                { clubId: 'club3', played: 38, won: 25, drawn: 8, lost: 5, goalsFor: 80, goalsAgainst: 30, points: 83 },
                { clubId: 'club4', played: 38, won: 15, drawn: 10, lost: 13, goalsFor: 50, goalsAgainst: 50, points: 55 },
                { clubId: 'club5', played: 38, won: 10, drawn: 5, lost: 23, goalsFor: 35, goalsAgainst: 65, points: 35 },
                { clubId: 'club6', played: 38, won: 5, drawn: 3, lost: 30, goalsFor: 20, goalsAgainst: 80, points: 18 }
            ],
            save: jest.fn().mockResolvedValue(true)
        };
        it('should identify promoted and relegated clubs', async () => {
            League_1.League.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockLeague)
            });
            const result = await leagueService.processPromotionRelegation('1');
            expect(League_1.League.findById).toHaveBeenCalledWith('1');
            expect(result.promoted).toHaveLength(3);
            expect(result.relegated).toHaveLength(3);
            expect(result.promoted[0].clubId).toBe('club1');
            expect(result.relegated[0].clubId).toBe('club6');
        });
        it('should throw error when league not found', async () => {
            League_1.League.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(null)
            });
            await expect(leagueService.processPromotionRelegation('999')).rejects.toThrow('League not found');
        });
    });
});
