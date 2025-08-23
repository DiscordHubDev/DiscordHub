'use server';

import { getRedis } from '@/lib/redis';
import { UserProfile } from '../types';

type DiscordUserCache = {
  username: string;
  global_name: string;
  avatar_url: string | null;
  banner_url: string | null;
  accent_color: string | null;
  updatedAt: string; // ISO
};

const CACHE_KEY = (userId: string) => `dc:user:${userId}`;

/**
 * 永遠快取版本：
 * 1) 先讀 Redis；命中就直接回傳
 * 2) 未命中時，若 allowNetwork=true 才打一次 Discord，並永久寫入 Redis（不設 TTL）
 * 3) 後續一律只讀快取；要更新請手動 invalidate
 */
export async function getDiscordMember(
  userId: string,
  options?: { allowNetwork?: boolean },
): Promise<UserProfile | null> {
  if (!/^\d{5,}$/.test(userId)) throw new Error('Invalid userId');

  const redis = getRedis();
  await redis.connect().catch(() => {}); // lazy connect

  const key = CACHE_KEY(userId);
  const cachedStr = await redis.get(key);
  if (cachedStr) {
    try {
      return JSON.parse(cachedStr) as UserProfile;
    } catch {
      // 破損就刪
      await redis.del(key);
    }
  }

  const allowNetwork = options?.allowNetwork ?? true;
  if (!allowNetwork) return null;

  const botToken = process.env.BOT_TOKEN;
  if (!botToken) throw new Error('Server misconfigured: BOT_TOKEN missing.');

  const fresh = await fetchDiscordUserOnce(userId, botToken);
  if (!fresh) return null;

  const payload: UserProfile = {
    ...fresh,
    updatedAt: new Date().toISOString(),
  };

  console.log(`🔄 Discord user ${userId} cache miss, fetched from API.`);

  // 永久快取：不設 TTL
  await redis.set(key, JSON.stringify(payload));

  return payload;
}

export async function invalidateDiscordMemberCache(userId: string) {
  const redis = getRedis();
  await redis.connect().catch(() => {});
  await redis.del(CACHE_KEY(userId));
}

// === Internal ===

async function fetchDiscordUserOnce(userId: string, botToken: string) {
  const endpoint = `https://discord.com/api/v10/users/${userId}`;

  // 工具：避免外洩 token、讀取 header、擷取 body 內容
  const maskToken = (t: string) => (t ? `${t.slice(0, 8)}…[redacted]` : '');
  const h = (resp: Response, name: string) => resp.headers.get(name);
  const pickHeaders = (resp: Response, keys: string[]) =>
    Object.fromEntries(keys.map(k => [k, h(resp, k)]));

  let resp: Response;
  try {
    resp = await fetch(endpoint, {
      headers: {
        Authorization: `Bot ${botToken}`,
        'User-Agent': 'DiscordBot (next-server-action, 1.0)',
      },
      cache: 'no-store',
      // @ts-expect-error cf option is ignored outside CF
      cf: { cacheTtl: 0 },
    });
  } catch (err: any) {
    console.error('Discord fetch network error', {
      endpoint,
      method: 'GET',
      userId,
      token: maskToken(botToken),
      errorName: err?.name,
      errorMessage: err?.message,
      // 只印出前幾行 stack，避免 log 過長
      errorStack:
        typeof err?.stack === 'string'
          ? err.stack.split('\n').slice(0, 5).join('\n')
          : undefined,
    });
    return null;
  }

  // 429: Too Many Requests
  if (resp.status === 429) {
    let body: any = null;
    try {
      body = await resp.clone().json();
    } catch {
      try {
        const txt = await resp.text();
        body = { text: txt.slice(0, 500) };
      } catch {
        body = { text: '[unreadable]' };
      }
    }

    const rateHeaders = pickHeaders(resp, [
      'x-ratelimit-global',
      'x-ratelimit-bucket',
      'x-ratelimit-scope',
      'x-ratelimit-remaining',
      'x-ratelimit-reset',
      'x-ratelimit-reset-after',
      'retry-after',
      'date',
      'via',
    ]);

    const retryAfterSec =
      (typeof body?.retry_after === 'number' ? body.retry_after : null) ??
      (rateHeaders['x-ratelimit-reset-after']
        ? Number(rateHeaders['x-ratelimit-reset-after'])
        : null) ??
      (rateHeaders['retry-after'] ? Number(rateHeaders['retry-after']) : null);

    console.error('Discord fetch rate limited (429)', {
      endpoint,
      method: 'GET',
      userId,
      token: maskToken(botToken),
      status: resp.status,
      statusText: resp.statusText,
      rateHeaders,
      // Discord 常見錯誤欄位
      discordError: {
        message: body?.message,
        code: body?.code,
        global: body?.global,
        retry_after: body?.retry_after,
      },
      hint: 'Wait and retry after the indicated seconds.',
      retryAfterSec,
    });

    // 不寫入；讓上層回 null（之後可手動 invalidate 再取）
    return null;
  }

  // 非 OK 狀態：輸出更詳細錯誤訊息
  if (!resp.ok) {
    let parsed: any = null;
    let bodyPreview = '';
    try {
      parsed = await resp.clone().json();
    } catch {
      try {
        const txt = await resp.text();
        bodyPreview = txt.slice(0, 1000);
      } catch {
        bodyPreview = '[unreadable]';
      }
    }

    const importantHeaders = pickHeaders(resp, [
      'content-type',
      'date',
      'via',
      'x-ratelimit-bucket',
      'x-ratelimit-remaining',
      'x-ratelimit-reset',
      'x-ratelimit-reset-after',
    ]);

    console.error('Discord fetch failed', {
      endpoint,
      method: 'GET',
      userId,
      token: maskToken(botToken),
      status: resp.status,
      statusText: resp.statusText,
      headers: importantHeaders,
      // 盡量給出 Discord 的錯誤訊息與代碼
      discordError:
        parsed && typeof parsed === 'object'
          ? {
              message: parsed.message,
              code: parsed.code,
              errors: parsed.errors, // 若有 validation errors
            }
          : undefined,
      bodyPreview:
        parsed && typeof parsed === 'object' ? undefined : bodyPreview,
    });

    return null;
  }

  // ---- OK 路徑 ----
  const userData = await resp.json();

  // Banner
  let bannerUrl: string | null = null;
  if (userData.banner) {
    const bannerFormat = String(userData.banner).startsWith('a_')
      ? 'gif'
      : 'png';
    bannerUrl = `https://cdn.discordapp.com/banners/${userId}/${userData.banner}.${bannerFormat}?size=512`;
  }

  // Avatar with fallback
  let avatarUrl: string | null = null;
  if (userData.avatar) {
    const avatarFormat = String(userData.avatar).startsWith('a_')
      ? 'gif'
      : 'png';
    avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${userData.avatar}.${avatarFormat}?size=512`;
  } else {
    const fallbackIndex = Number(BigInt(userId) % BigInt(6));
    avatarUrl = `https://cdn.discordapp.com/embed/avatars/${fallbackIndex}.png`;
  }

  // Accent color
  let accentColorHex: string | null = null;
  if (userData.accent_color !== null && userData.accent_color !== undefined) {
    accentColorHex = `#${userData.accent_color.toString(16).padStart(6, '0')}`;
  } else {
    const hash = djb2Hash(userData.avatar || 'default');
    const hue = hash % 360;
    accentColorHex = hslToHex(hue, 60, 55);
  }

  return {
    username: userData.username as string,
    global_name: (userData.global_name || userData.username) as string,
    avatar_url: avatarUrl,
    banner_url: bannerUrl,
    accent_color: accentColorHex,
  };
}

function djb2Hash(str: string) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) hash = (hash * 33) ^ str.charCodeAt(i);
  return hash >>> 0;
}

function hslToHex(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    Math.round(
      255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))),
    );
  return (
    '#' +
    f(0).toString(16).padStart(2, '0') +
    f(8).toString(16).padStart(2, '0') +
    f(4).toString(16).padStart(2, '0')
  );
}
