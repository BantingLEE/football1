import { randomUUID } from 'crypto';

export interface TracingContext {
  correlationId: string;
  requestId: string;
  userId?: string;
  [key: string]: string | undefined;
}

class Tracing {
  private static readonly CORRELATION_ID_HEADER = 'x-correlation-id';
  private static readonly REQUEST_ID_HEADER = 'x-request-id';
  private static readonly USER_ID_HEADER = 'x-user-id';

  static generateCorrelationId(): string {
    return randomUUID();
  }

  static generateRequestId(): string {
    return `${Date.now()}-${randomUUID().substring(0, 8)}`;
  }

  static extractContext(headers: Record<string, string | string[] | undefined>): TracingContext {
    const getHeaderValue = (header: string): string | undefined => {
      const value = headers[header.toLowerCase()];
      if (Array.isArray(value)) {
        return value[0];
      }
      return value;
    };

    return {
      correlationId: getHeaderValue(this.CORRELATION_ID_HEADER) || this.generateCorrelationId(),
      requestId: getHeaderValue(this.REQUEST_ID_HEADER) || this.generateRequestId(),
      userId: getHeaderValue(this.USER_ID_HEADER),
    };
  }

  static setHeaders(context: TracingContext): Record<string, string> {
    return {
      [this.CORRELATION_ID_HEADER]: context.correlationId,
      [this.REQUEST_ID_HEADER]: context.requestId,
      ...(context.userId && { [this.USER_ID_HEADER]: context.userId }),
    };
  }

  static toLogContext(context: TracingContext): Record<string, string> {
    return {
      correlationId: context.correlationId,
      requestId: context.requestId,
      ...(context.userId && { userId: context.userId }),
    };
  }

  static createChildContext(parentContext: TracingContext): TracingContext {
    return {
      ...parentContext,
      requestId: this.generateRequestId(),
    };
  }
}

export { Tracing };
