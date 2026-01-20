import { MigrationRunner } from './runner'
import { migration001AddClubIndexes } from './001_add_club_indexes'
import { migration002AddPlayerIndexes } from './002_add_player_indexes'
import { migration003AddMatchIndexes } from './003_add_match_indexes'
import { migration004AddYouthFacilityIndexes } from './004_add_youth_facility_indexes'

const runner = new MigrationRunner()

runner.register(migration001AddClubIndexes)
runner.register(migration002AddPlayerIndexes)
runner.register(migration003AddMatchIndexes)
runner.register(migration004AddYouthFacilityIndexes)

export { runner }
export { MigrationRunner } from './runner'
export { Migration, MigrationRecord } from './runner'
