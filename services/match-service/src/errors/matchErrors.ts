export class MatchServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message)
    this.name = 'MatchServiceError'
  }
}

export class MatchNotFoundError extends MatchServiceError {
  constructor(message: string = 'Match not found') {
    super(message, 404)
    this.name = 'MatchNotFoundError'
  }
}

export class InvalidMatchIdError extends MatchServiceError {
  constructor(message: string = 'Invalid match ID format') {
    super(message, 400)
    this.name = 'InvalidMatchIdError'
  }
}

export class MatchValidationError extends MatchServiceError {
  constructor(message: string = 'Validation error') {
    super(message, 400)
    this.name = 'MatchValidationError'
  }
}

export class MatchSimulationError extends MatchServiceError {
  constructor(message: string = 'Match simulation failed') {
    super(message, 500)
    this.name = 'MatchSimulationError'
  }
}
