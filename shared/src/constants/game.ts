export const GAME_CONSTANTS = {
  MATCH: {
    DURATION: 90,
    EVENT_PROBABILITY: 0.3,
    GOAL_PROBABILITY: 0.15,
    REALTIME_DELAY_MS: 1000
  } as const,
  
  TEAM_STRENGTH: {
    MIN: 50,
    MAX: 90
  } as const,
  
  PLAYER: {
    ATTRIBUTES: {
      MIN: 40,
      MAX: 90,
      MAX_ATTRIBUTE: 99,
      MIN_ATTRIBUTE: 0
    } as const,
    AGE: {
      YOUTH_MIN: 14,
      YOUTH_MAX: 18,
      PRIME_MIN: 19,
      PRIME_MAX: 28,
      VETERAN_MIN: 29,
      VETERAN_MAX: 35,
      RETIREMENT_MIN: 36,
      RETIREMENT_MAX: 40
    } as const,
    GROWTH: {
      YOUTH_RATE: 3.0,
      PRIME_RATE: 0.8,
      DECLINE_RATE: -0.2,
      MIN_POTENTIAL_INCREASE: 10,
      MAX_POTENTIAL_INCREASE: 30,
      YOUTH_BASE_ATTRIBUTE: 40,
      YOUTH_ATTRIBUTE_VARIANCE: 30,
      INJURY_MULTIPLIER: 0.3
    } as const,
    VALUE: {
      AGE_YOUNG_FACTOR: 1.2,
      AGE_VETERAN_FACTOR: 0.6,
      BASE_MULTIPLIER: 10000,
      MAX_POTENTIAL: 99
    } as const
  } as const,
  
  YOUTH: {
    FACILITY: {
      MAX_LEVEL: 5,
      LEVELS: {
        1: { capacity: 10, quality: 0.3, newPlayersPerWeek: 1 },
        2: { capacity: 15, quality: 0.5, newPlayersPerWeek: 1 },
        3: { capacity: 20, quality: 0.7, newPlayersPerWeek: 2 },
        4: { capacity: 25, quality: 0.85, newPlayersPerWeek: 2 },
        5: { capacity: 30, quality: 1.0, newPlayersPerWeek: 3 }
      }
    } as const,
    NAME_RANGE: { MIN: 1, MAX: 9999 },
    HEIGHT_RANGE: { MIN: 165, MAX: 195 },
    WEIGHT_RANGE: { MIN: 60, MAX: 90 }
  } as const,
  
  LEAGUE: {
    DEFAULT_RULES: {
      PROMOTION_SLOTS: 3,
      RELEGATION_SLOTS: 3,
      POINTS: {
        WIN: 3,
        DRAW: 1,
        LOSS: 0
      }
    } as const,
    MIN_CLUBS: 2
  } as const,
  
  TRAINING: {
    TYPES: ['technical', 'physical', 'tactical', 'goalkeeping'] as const,
    YOUTH_TYPES: ['technical', 'physical', 'tactical', 'goalkeeping'] as const,
    DEFAULT_DURATION_DAYS: 7,
    WEEK_DIVISOR: 7
  } as const,
  
  ECONOMY: {
    DAYS_PER_WEEK: 7,
    DAYS_PER_MONTH: 30,
    DAYS_PER_YEAR: 365,
    PERIODS: ['weekly', 'monthly', 'yearly'] as const
  } as const,
  
  FORMATIONS: [
    '4-4-2',
    '4-3-3',
    '3-5-2',
    '4-2-3-1',
    '5-3-2',
    '3-4-3'
  ] as const,
  
  POSITIONS: [
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
    'RW'
  ] as const,
  
  NOTIFICATION: {
    HIGH_PRIORITY_TYPES: ['injury_report', 'transfer_complete'] as const,
    LOW_PRIORITY_TYPES: ['financial_report', 'training_complete'] as const
  } as const
} as const

export type Formation = typeof GAME_CONSTANTS.FORMATIONS[number]
export type Position = typeof GAME_CONSTANTS.POSITIONS[number]
export type TrainingType = typeof GAME_CONSTANTS.TRAINING.TYPES[number]
export type NotificationType = string
