// lib/redis.ts
import Redis from 'ioredis';

let _redis: Redis | null = null;

export function getRedis() {
  if (_redis) return _redis;

  // 優先 REDIS_URL；否則用 host/port/password
  const url = process.env.REDIS_URL;
  if (url) {
    _redis = new Redis(url, {
      // 建議開 TLS 時加上：tls: {},
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      lazyConnect: true,
    });
  } else {
    const host = process.env.REDIS_HOST || '127.0.0.1';
    const port = Number(process.env.REDIS_PORT || '6379');
    const password = process.env.REDIS_PASSWORD || undefined;
    _redis = new Redis({
      host,
      port,
      password,
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      lazyConnect: true,
    });
  }

  return _redis;
}
