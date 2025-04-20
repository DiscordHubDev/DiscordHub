// lib/memoryCache.ts
const cache = new Map<string, { value: any; expiresAt: number }>();

export async function setCache(key: string, value: any, ttlSeconds = 300) {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  cache.set(key, { value, expiresAt });
}

export async function getCache<T>(key: string): Promise<Awaited<T> | null> {
  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expiresAt) {
    cache.delete(key);
    return null;
  }

  return cached.value as Awaited<T>;
}
