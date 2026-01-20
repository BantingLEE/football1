export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogContext {
  correlationId?: string;
  userId?: string;
  service?: string;
  requestId?: string;
  [key: string]: unknown;
}

class Logger {
  private level: LogLevel;
  private serviceName: string;

  constructor(serviceName: string = 'unknown') {
    this.serviceName = serviceName;
    this.level = this.getLevelFromEnv(process.env.LOG_LEVEL);
  }

  private getLevelFromEnv(envLevel?: string): LogLevel {
    switch (envLevel?.toUpperCase()) {
      case 'DEBUG':
        return LogLevel.DEBUG;
      case 'INFO':
        return LogLevel.INFO;
      case 'WARN':
        return LogLevel.WARN;
      case 'ERROR':
        return LogLevel.ERROR;
      default:
        return LogLevel.INFO;
    }
  }

  private sanitize(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }

    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        return data.map(item => this.sanitize(item));
      }

      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        sanitized[key] = this.sanitizeValue(key, value);
      }
      return sanitized;
    }

    return data;
  }

  private sanitizeString(str: string): string {
    const sensitivePatterns = [
      { pattern: /password[:\s]*["']?([^"'\s]+)["']?/gi, replacement: 'password:***' },
      { pattern: /token[:\s]*["']?([^"'\s]+)["']?/gi, replacement: 'token:***' },
      { pattern: /secret[:\s]*["']?([^"'\s]+)["']?/gi, replacement: 'secret:***' },
      { pattern: /api[_-]?key[:\s]*["']?([^"'\s]+)["']?/gi, replacement: 'apiKey:***' },
      { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '***@***.***' },
      { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '***-**-****' },
      { pattern: /Bearer\s+[A-Za-z0-9._-]+/gi, replacement: 'Bearer ***' },
    ];

    let result = str;
    for (const { pattern, replacement } of sensitivePatterns) {
      result = result.replace(pattern, replacement);
    }
    return result;
  }

  private sanitizeValue(key: string, value: unknown): unknown {
    const sensitiveKeys = [
      'password', 'token', 'secret', 'apiKey', 'api_key', 'authorization',
      'creditCard', 'ssn', 'socialSecurityNumber', 'pin', 'otp',
      'accessToken', 'refreshToken', 'sessionToken', 'jwt',
    ];

    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      return '***';
    }

    return this.sanitize(value);
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(this.sanitize(context)) : '{}';
    return JSON.stringify({
      timestamp,
      level,
      service: this.serviceName,
      message: this.sanitizeString(message),
      context: JSON.parse(contextStr),
    });
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage('DEBUG', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage('INFO', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorContext: LogContext = {
        ...context,
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack,
        } : { error: String(error) },
      };
      console.error(this.formatMessage('ERROR', message, errorContext));
    }
  }
}

let loggerInstance: Logger;

export function initLogger(serviceName: string): Logger {
  loggerInstance = new Logger(serviceName);
  return loggerInstance;
}

export function getLogger(): Logger {
  if (!loggerInstance) {
    loggerInstance = new Logger();
  }
  return loggerInstance;
}

export { Logger };
