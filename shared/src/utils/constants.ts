export const FORMATIONS = [
  '4-4-2',
  '4-3-3',
  '3-5-2',
  '4-2-3-1',
  '5-3-2',
  '3-4-3',
] as const

export const POSITIONS = [
  'GK',
  'CB',
  'RB',
  'LB',
  'CDM',
  'CM',
  'CAM',
  'RM',
  'LM',
  'ST',
  'CF',
  'LW',
  'RW',
] as const

export const MATCH_DURATION = 90

export const YOUTH_FACILITY_LEVELS = {
  1: { capacity: 10, quality: 0.3, newPlayersPerWeek: 1 },
  2: { capacity: 15, quality: 0.5, newPlayersPerWeek: 1 },
  3: { capacity: 20, quality: 0.7, newPlayersPerWeek: 2 },
  4: { capacity: 25, quality: 0.85, newPlayersPerWeek: 2 },
  5: { capacity: 30, quality: 1.0, newPlayersPerWeek: 3 },
}

export const PLAYER_AGE_GROUPS = {
  YOUTH: { min: 14, max: 18 },
  PRIME: { min: 19, max: 28 },
  VETERAN: { min: 29, max: 35 },
  RETIREMENT: { min: 36, max: 40 },
}
