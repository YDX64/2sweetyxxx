// Mock Redis client for development (replace with actual redis package in production)
// import { createClient } from 'redis';

// Redis client configuration
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Mock Redis client interface
interface MockRedisClient {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
  setex: (key: string, seconds: number, value: string) => Promise<void>;
  setEx: (key: string, seconds: number, value: string) => Promise<void>;
  del: (key: string | string[]) => Promise<void>;
  expire: (key: string, seconds: number) => Promise<void>;
  keys: (pattern: string) => Promise<string[]>;
  publish: (channel: string, message: string) => Promise<void>;
  subscribe: (channel: string, callback: (message: string) => void) => Promise<void>;
  unsubscribe: (channel: string) => Promise<void>;
  on: (event: string, handler: (err?: any) => void) => void;
  connect: () => Promise<void>;
  duplicate: () => MockRedisClient;
  quit: () => Promise<void>;
}

// Mock implementation
const createMockClient = (): MockRedisClient => {
  const cache = new Map<string, { value: string; expiry?: number }>();
  
  return {
    get: async (key: string) => {
      const item = cache.get(key);
      if (!item) return null;
      if (item.expiry && item.expiry < Date.now()) {
        cache.delete(key);
        return null;
      }
      return item.value;
    },
    set: async (key: string, value: string) => {
      cache.set(key, { value });
    },
    setex: async (key: string, seconds: number, value: string) => {
      cache.set(key, { value, expiry: Date.now() + seconds * 1000 });
    },
    setEx: async (key: string, seconds: number, value: string) => {
      cache.set(key, { value, expiry: Date.now() + seconds * 1000 });
    },
    del: async (keys: string | string[]) => {
      if (Array.isArray(keys)) {
        keys.forEach(key => cache.delete(key));
      } else {
        cache.delete(keys);
      }
    },
    keys: async (pattern: string) => {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return Array.from(cache.keys()).filter(key => regex.test(key));
    },
    publish: async (channel: string, message: string) => {
      console.log(`Mock publish to ${channel}:`, message);
    },
    subscribe: async (channel: string, callback: (message: string) => void) => {
      console.log(`Mock subscribe to ${channel}`);
    },
    unsubscribe: async (channel: string) => {
      console.log(`Mock unsubscribe from ${channel}`);
    },
    expire: async (key: string, seconds: number) => {
      const item = cache.get(key);
      if (item) {
        item.expiry = Date.now() + seconds * 1000;
      }
    },
    on: (event: string, handler: (err?: any) => void) => {
      // Mock event handling
      if (event === 'connect') setTimeout(() => handler(), 100);
    },
    connect: async () => {
      console.log('Mock Redis connected');
    },
    duplicate: () => createMockClient(),
    quit: async () => {
      cache.clear();
      console.log('Mock Redis connection closed');
    }
  };
};

export const redisClient = createMockClient();

// Redis pub/sub clients for real-time features
export const redisPub = redisClient.duplicate();
export const redisSub = redisClient.duplicate();

// Mock event handling
redisClient.on('error', (err?: any) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('✅ Mock Redis connected'));
redisClient.on('ready', () => console.log('✅ Mock Redis ready'));
redisClient.on('reconnecting', () => console.log('🔄 Mock Redis reconnecting...'));

// Initialize Redis connections
export async function initializeRedis() {
  try {
    await Promise.all([
      redisClient.connect(),
      redisPub.connect(),
      redisSub.connect(),
    ]);
    console.log('✅ All Redis clients connected');
  } catch (error) {
    console.error('❌ Redis initialization failed:', error);
    throw error;
  }
}

// Cache helpers
export const cache = {
  // Get cached data
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  // Set cache with TTL (in seconds)
  async set(key: string, value: any, ttl = 3600): Promise<void> {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  },

  // Delete cache
  async del(key: string | string[]): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error(`Cache delete error:`, error);
    }
  },

  // Clear cache by pattern
  async clearPattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error(`Cache clear pattern error:`, error);
    }
  },
};

// Pub/Sub helpers for real-time
export const pubsub = {
  // Publish message to channel
  async publish(channel: string, message: any): Promise<void> {
    try {
      await redisPub.publish(channel, JSON.stringify(message));
    } catch (error) {
      console.error(`PubSub publish error:`, error);
    }
  },

  // Subscribe to channel
  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    try {
      await redisSub.subscribe(channel, (message) => {
        try {
          const data = JSON.parse(message);
          callback(data);
        } catch (error) {
          console.error('PubSub message parse error:', error);
        }
      });
    } catch (error) {
      console.error(`PubSub subscribe error:`, error);
    }
  },

  // Unsubscribe from channel
  async unsubscribe(channel: string): Promise<void> {
    try {
      await redisSub.unsubscribe(channel);
    } catch (error) {
      console.error(`PubSub unsubscribe error:`, error);
    }
  },
};

// Cleanup function
export async function closeRedisConnections() {
  await Promise.all([
    redisClient.quit(),
    redisPub.quit(),
    redisSub.quit(),
  ]);
  console.log('Redis connections closed');
}