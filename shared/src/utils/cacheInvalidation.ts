import { createClient, RedisClientType } from 'redis'

export interface CacheInvalidationConfig {
  redisUrl?: string
  defaultTTL?: number
  channelPrefix?: string
}

export class CacheInvalidation {
  private redis: RedisClientType
  private pubClient: RedisClientType
  private subClient: RedisClientType
  private defaultTTL: number
  private channelPrefix: string
  private connected: boolean = false

  constructor(config: CacheInvalidationConfig = {}) {
    const redisUrl = config.redisUrl || process.env.REDIS_URL || 'redis://localhost:6379'
    
    this.redis = createClient({ url: redisUrl })
    this.pubClient = createClient({ url: redisUrl })
    this.subClient = createClient({ url: redisUrl })
    this.defaultTTL = config.defaultTTL || 3600
    this.channelPrefix = config.channelPrefix || 'cache:invalidation'

    this.setupErrorHandlers()
  }

  private setupErrorHandlers(): void {
    this.redis.on('error', (err) => console.error('Redis error:', err))
    this.pubClient.on('error', (err) => console.error('Redis pub client error:', err))
    this.subClient.on('error', (err) => console.error('Redis sub client error:', err))
  }

  async connect(): Promise<void> {
    if (this.connected) return

    await Promise.all([
      this.redis.connect(),
      this.pubClient.connect(),
      this.subClient.connect()
    ])
    this.connected = true
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return

    await Promise.all([
      this.redis.disconnect(),
      this.pubClient.disconnect(),
      this.subClient.disconnect()
    ])
    this.connected = false
  }

  async get(key: string): Promise<string | null> {
    if (!this.connected) await this.connect()
    return await this.redis.get(key)
  }

  async getJson<T>(key: string): Promise<T | null> {
    const data = await this.get(key)
    if (!data) return null
    try {
      return JSON.parse(data) as T
    } catch {
      return null
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.connected) await this.connect()
    const expiration = ttl || this.defaultTTL
    await this.redis.setEx(key, expiration, value)
  }

  async setJson<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttl)
  }

  async delete(key: string): Promise<void> {
    if (!this.connected) await this.connect()
    await this.redis.del(key)
    await this.publishInvalidation(key)
  }

  async deletePattern(pattern: string): Promise<void> {
    if (!this.connected) await this.connect()
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(keys)
      keys.forEach(key => this.publishInvalidation(key))
    }
  }

  private async publishInvalidation(key: string): Promise<void> {
    const channel = `${this.channelPrefix}:${key}`
    await this.pubClient.publish(channel, JSON.stringify({ key, timestamp: Date.now() }))
  }

  async subscribe(pattern: string, callback: (key: string) => Promise<void> | void): Promise<void> {
    if (!this.connected) await this.connect()
    await this.subClient.pSubscribe(`${this.channelPrefix}:${pattern}`, async (message) => {
      try {
        const data = JSON.parse(message)
        await callback(data.key)
      } catch (err) {
        console.error('Error processing cache invalidation:', err)
      }
    })
  }

  async invalidatePlayer(playerId: string): Promise<void> {
    await Promise.all([
      this.delete(`player:${playerId}`),
      this.delete(`player:${playerId}:stats`),
      this.deletePattern(`players:club:*`),
    ])
  }

  async invalidateClub(clubId: string): Promise<void> {
    await Promise.all([
      this.delete(`club:${clubId}`),
      this.delete(`club:${clubId}:players`),
      this.deletePattern(`matches:club:${clubId}:*`),
    ])
  }

  async invalidateMatch(matchId: string): Promise<void> {
    await Promise.all([
      this.delete(`match:${matchId}`),
      this.deletePattern(`matches:league:*`),
    ])
  }

  async invalidateLeague(leagueId: string): Promise<void> {
    await Promise.all([
      this.delete(`league:${leagueId}`),
      this.delete(`league:${leagueId}:matches`),
      this.delete(`league:${leagueId}:standings`),
      this.deletePattern(`matches:league:${leagueId}:*`),
    ])
  }
}

let cacheInvalidationInstance: CacheInvalidation | null = null

export function getCacheInvalidation(): CacheInvalidation {
  if (!cacheInvalidationInstance) {
    cacheInvalidationInstance = new CacheInvalidation()
  }
  return cacheInvalidationInstance
}