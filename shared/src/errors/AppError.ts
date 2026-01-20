export interface ErrorContext {
  [key: string]: unknown;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;
  public readonly context: ErrorContext;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code: string = 'INTERNAL_ERROR',
    context: ErrorContext = {}
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.context = context;

    Error.captureStackTrace(this);
  }

  toJSON(): Record<string, unknown> {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', context: ErrorContext = {}) {
    super(message, 400, true, 'VALIDATION_ERROR', context);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', id?: string, context: ErrorContext = {}) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(message, 404, true, 'NOT_FOUND', { ...context, resource, id });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', context: ErrorContext = {}) {
    super(message, 401, true, 'UNAUTHORIZED', context);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', context: ErrorContext = {}) {
    super(message, 403, true, 'FORBIDDEN', context);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', context: ErrorContext = {}) {
    super(message, 409, true, 'CONFLICT', context);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number, context: ErrorContext = {}) {
    super(message, 429, true, 'RATE_LIMIT_EXCEEDED', { ...context, retryAfter });
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service unavailable', context: ErrorContext = {}) {
    super(message, 503, true, 'SERVICE_UNAVAILABLE', context);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toAppError(error: unknown, defaultMessage: string = 'An unexpected error occurred'): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, 500, false, 'INTERNAL_ERROR', {
      originalError: error.name,
    });
  }

  return new AppError(defaultMessage, 500, false, 'INTERNAL_ERROR', {
    originalError: String(error),
  });
}
