import "server-only";

import Redis from "ioredis";

type GlobalRedis = {
  __aksaventraRedisClient?: Redis | null;
  __aksaventraRedisSub?: Redis | null;
};

function getRedisUrl(): string | null {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;
  const lower = url.toLowerCase();
  if (lower === "false" || lower === "off" || lower === "disabled") {
    return null;
  }
  return url;
}

function createRedisConnection(url: string, label: string): Redis {
  const client = new Redis(url, {
    connectTimeout: 2000,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    enableReadyCheck: true,
    lazyConnect: false,
    retryStrategy(times) {
      if (times > 5) return null;
      return Math.min(times * 300, 3000);
    },
  });

  client.on("error", (err) => {
    console.warn(`[Redis:${label}] connection error:`, err.message);
  });

  return client;
}

/**
 * Shared Redis command client for cross-worker PM2 cluster state
 * (rate limiting, proctor chat storage, and publishing events).
 * Returns null when REDIS_URL is not configured.
 */
export function getRedisClient(): Redis | null {
  const url = getRedisUrl();
  if (!url) return null;

  const g = globalThis as unknown as GlobalRedis;
  if (!g.__aksaventraRedisClient) {
    g.__aksaventraRedisClient = createRedisConnection(url, "cmd");
  }
  return g.__aksaventraRedisClient;
}

/**
 * Dedicated Redis Pub/Sub subscriber client (Redis requires a separate
 * connection once SUBSCRIBE mode is entered).
 * Returns null when REDIS_URL is not configured.
 */
export function getRedisSubscriber(): Redis | null {
  const url = getRedisUrl();
  if (!url) return null;

  const g = globalThis as unknown as GlobalRedis;
  if (!g.__aksaventraRedisSub) {
    g.__aksaventraRedisSub = createRedisConnection(url, "sub");
  }
  return g.__aksaventraRedisSub;
}
