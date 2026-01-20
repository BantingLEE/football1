"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clubService_1 = require("../src/services/clubService");
const Club_1 = require("../src/models/Club");
jest.mock('../src/models/Club');
describe('ClubService', () => {
    let clubService;
    beforeEach(() => {
        clubService = new clubService_1.ClubService();
    });
    describe('getAllClubs', () => {
        it('should return all clubs', async () => {
            const mockClubs = [
                { _id: '1', name: 'FC Barcelona', city: 'Barcelona' },
                { _id: '2', name: 'Real Madrid', city: 'Madrid' }
            ];
            Club_1.Club.find = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockClubs)
            });
            const result = await clubService.getAllClubs();
            expect(Club_1.Club.find).toHaveBeenCalled();
            expect(result).toEqual(mockClubs);
        });
    });
    describe('createClub', () => {
        it('should create a new club', async () => {
            const clubData = {
                name: 'Test Club',
                foundedYear: 2000,
                city: 'Test City'
            };
            Club_1.Club.create = jest.fn().mockResolvedValue({
                _id: '1',
                ...clubData
            });
            const result = await clubService.createClub(clubData);
            expect(Club_1.Club.create).toHaveBeenCalledWith(clubData);
            expect(result._id).toBe('1');
        });
    });
});
