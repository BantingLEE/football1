import { ClubService } from '../src/services/clubService'
import { Club } from '../src/models/Club'

jest.mock('../src/models/Club')

describe('ClubService', () => {
  let clubService: ClubService

  beforeEach(() => {
    clubService = new ClubService()
  })

  describe('getAllClubs', () => {
    it('should return all clubs', async () => {
      const mockClubs = [
        { _id: '1', name: 'FC Barcelona', city: 'Barcelona' },
        { _id: '2', name: 'Real Madrid', city: 'Madrid' }
      ]

      Club.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockClubs)
      } as any)

      const result = await clubService.getAllClubs()

      expect(Club.find).toHaveBeenCalled()
      expect(result).toEqual(mockClubs)
    })
  })

  describe('createClub', () => {
    it('should create a new club', async () => {
      const clubData = {
        name: 'Test Club',
        foundedYear: 2000,
        city: 'Test City'
      }

      Club.create = jest.fn().mockResolvedValue({
        _id: '1',
        ...clubData
      })

      const result = await clubService.createClub(clubData)

      expect(Club.create).toHaveBeenCalledWith(clubData)
      expect(result._id).toBe('1')
    })
  })
})
