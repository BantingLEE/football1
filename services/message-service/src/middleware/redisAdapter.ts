import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Server as SocketIOServer } from 'socket.io';

export class RedisAdapter {
  private pubClient: ReturnType<typeof createClient>;
  private subClient: ReturnType<typeof createClient>;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    this.pubClient = createClient({ url: redisUrl });
    this.subClient = createClient({ url: redisUrl });

    this.pubClient.on('error', (err) => {
      console.error('Redis pub client error:', err);
    });

    this.subClient.on('error', (err) => {
      console.error('Redis sub client error:', err);
    });
  }

  async connect(): Promise<void> {
    await Promise.all([
      this.pubClient.connect(),
      this.subClient.connect()
    ]);
    console.log('Redis adapter connected');
  }

  async disconnect(): Promise<void> {
    await Promise.all([
      this.pubClient.disconnect(),
      this.subClient.disconnect()
    ]);
  }

  adapt(io: SocketIOServer): void {
    io.adapter(createAdapter(this.pubClient, this.subClient));
  }

  getPubClient() {
    return this.pubClient;
  }

  getSubClient() {
    return this.subClient;
  }
}
