export interface RetryConfig {
  maxAttempts?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
  jitter?: boolean
  timeout?: number
  retryableErrors?: (error: any) => boolean
  onRetry?: (attempt: number, error: any) => void
}

export interface CircuitBreakerConfig {
  failureThreshold?: number
  resetTimeout?: number
  monitoringPeriod?: number
}

export interface CircuitBreakerState {
  failures: number
  lastFailureTime: number | null
  isOpen: boolean
  nextAttemptTime: number | null
}

export class CircuitBreaker {
  private state: CircuitBreakerState = {
    failures: 0,
    lastFailureTime: null,
    isOpen: false,
    nextAttemptTime: null
  }
  private config: Required<CircuitBreakerConfig>

  constructor(config: CircuitBreakerConfig = {}) {
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      resetTimeout: config.resetTimeout || 60000,
      monitoringPeriod: config.monitoringPeriod || 10000
    }
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state.isOpen) {
      if (Date.now() < (this.state.nextAttemptTime || 0)) {
        throw new Error('Circuit breaker is OPEN')
      }
      this.reset()
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.state.failures = 0
    this.state.lastFailureTime = null
    this.state.isOpen = false
    this.state.nextAttemptTime = null
  }

  private onFailure(): void {
    this.state.failures++
    this.state.lastFailureTime = Date.now()

    if (this.state.failures >= this.config.failureThreshold) {
      this.state.isOpen = true
      this.state.nextAttemptTime = Date.now() + this.config.resetTimeout
      console.warn(`Circuit breaker OPEN after ${this.state.failures} failures`)
    }
  }

  private reset(): void {
    console.log('Circuit breaker attempting to reset')
    this.state.failures = 0
    this.state.isOpen = false
    this.state.nextAttemptTime = null
  }

  getState(): CircuitBreakerState {
    return { ...this.state }
  }

  isClosed(): boolean {
    return !this.state.isOpen
  }
}

const circuitBreakers = new Map<string, CircuitBreaker>()

export function getCircuitBreaker(key: string, config?: CircuitBreakerConfig): CircuitBreaker {
  if (!circuitBreakers.has(key)) {
    circuitBreakers.set(key, new CircuitBreaker(config))
  }
  return circuitBreakers.get(key)!
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const finalConfig: Required<RetryConfig> = {
    maxAttempts: config.maxAttempts || 3,
    initialDelay: config.initialDelay || 100,
    maxDelay: config.maxDelay || 10000,
    backoffMultiplier: config.backoffMultiplier || 5,
    jitter: config.jitter !== false,
    timeout: config.timeout || 30000,
    retryableErrors: config.retryableErrors || defaultRetryableErrors,
    onRetry: config.onRetry || (() => {})
  }

  let lastError: any
  let attempt = 0

  while (attempt < finalConfig.maxAttempts) {
    attempt++

    try {
      const result = await Promise.race([
        fn(),
        createTimeout(finalConfig.timeout)
      ])
      return result
    } catch (error) {
      lastError = error

      if (!finalConfig.retryableErrors(error)) {
        throw error
      }

      if (attempt >= finalConfig.maxAttempts) {
        break
      }

      const delay = calculateDelay(attempt, finalConfig)
      finalConfig.onRetry(attempt, error)
      console.log(`Retry attempt ${attempt}/${finalConfig.maxAttempts} after ${delay}ms delay. Error: ${(error as Error).message}`)
      
      await sleep(delay)
    }
  }

  throw new Error(`Operation failed after ${finalConfig.maxAttempts} attempts. Last error: ${lastError?.message || lastError}`)
}

function defaultRetryableErrors(error: any): boolean {
  if (!error) return false
  
  const errorMessage = error.message || String(error)
  const retryablePatterns = [
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EAI_AGAIN',
    'timeout',
    'network',
    'fetch failed'
  ]

  return retryablePatterns.some(pattern => errorMessage.toLowerCase().includes(pattern.toLowerCase()))
}

function calculateDelay(attempt: number, config: Required<RetryConfig>): number {
  let delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1)
  delay = Math.min(delay, config.maxDelay)

  if (config.jitter) {
    delay = delay * (0.5 + Math.random() * 0.5)
  }

  return Math.round(delay)
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
  })
}

export function wrapFetch(input: string | Request | URL, init?: RequestInit, retryConfig?: RetryConfig): Promise<Response> {
  return retryWithBackoff(async () => {
    const response = await fetch(input, init)
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
      ;(error as any).status = response.status
      ;(error as any).response = response
      throw error
    }
    return response
  }, {
    ...retryConfig,
    retryableErrors: (error) => {
      return defaultRetryableErrors(error) || (error.status >= 500 && error.status < 600)
    }
  })
}

export function createRetryableFetch(retryConfig?: RetryConfig) {
  return (input: string | Request | URL, init?: RequestInit) => wrapFetch(input, init, retryConfig)
}

export async function withCircuitBreaker<T>(
  key: string,
  fn: () => Promise<T>,
  retryConfig?: RetryConfig,
  circuitBreakerConfig?: CircuitBreakerConfig
): Promise<T> {
  const circuitBreaker = getCircuitBreaker(key, circuitBreakerConfig)
  
  return circuitBreaker.execute(async () => {
    return retryWithBackoff(fn, retryConfig)
  })
}

export class RetryMetrics {
  private attempts: Map<string, number[]> = new Map()
  private failures: Map<string, number> = new Map()
  private successes: Map<string, number> = new Map()

  recordAttempt(operation: string): void {
    if (!this.attempts.has(operation)) {
      this.attempts.set(operation, [])
    }
    this.attempts.get(operation)!.push(Date.now())
  }

  recordFailure(operation: string): void {
    this.failures.set(operation, (this.failures.get(operation) || 0) + 1)
  }

  recordSuccess(operation: string): void {
    this.successes.set(operation, (this.successes.get(operation) || 0) + 1)
  }

  getMetrics(operation: string) {
    const attempts = this.attempts.get(operation) || []
    const failures = this.failures.get(operation) || 0
    const successes = this.successes.get(operation) || 0

    return {
      attempts: attempts.length,
      failures,
      successes,
      successRate: attempts.length > 0 ? successes / attempts.length : 0
    }
  }

  getAllMetrics() {
    const metrics: Record<string, any> = {}
    for (const operation of this.attempts.keys()) {
      metrics[operation] = this.getMetrics(operation)
    }
    return metrics
  }
}

export const retryMetrics = new RetryMetrics()