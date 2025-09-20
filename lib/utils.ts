import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DiscordBotRPCInfo, UserProfile } from './types';
import { unstable_cache } from 'next/cache';
import { getAllBots, getBot, getUserVotesForBots } from './actions/bots';
import {
  getAllServers,
  getServerByGuildId,
  getServerWithFavoritedByGuildId,
} from './actions/servers';
import { getDiscordMember } from './actions/discord';

export const GetbaseUrl = function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL)
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
};

export type PriorityInput = {
  upvotes?: number;
  servers?: number;
};

// 對 token 做 HMAC-SHA256（Edge 可用 Web Crypto）
export async function hmacSha256Hex(
  message: string,
  secret: string,
): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return toHex(sig);
}

function toHex(buf: ArrayBuffer | Uint8Array): string {
  const view = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  let out = '';
  for (let i = 0; i < view.length; i++) {
    const h = view[i].toString(16).padStart(2, '0');
    out += h;
  }
  return out;
}

// build og url function
function parsePositiveInt(v: number, min = 50, max = 4096) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return v;
  return Math.min(Math.max(Math.floor(n), min), max);
}

export function buildOgUrl(opts: {
  previewImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
}) {
  const { previewImage, twitterCard = 'summary_large_image' } = opts;

  const isLarge = twitterCard === 'summary_large_image';
  const defaults = isLarge
    ? { width: 1200, height: 630 }
    : { width: 80, height: 80 };

  const width = parsePositiveInt(defaults.width);
  const height = parsePositiveInt(defaults.height);

  const img = previewImage;

  const sp = new URLSearchParams();
  sp.set('width', String(width));
  sp.set('height', String(height));
  if (img) sp.set('img', img);

  const ogUrl = `/api/og?${sp.toString()}`;
  return { ogUrl, width, height, img };
}

// server cache

export const getCachedAllServers = unstable_cache(
  async () => getAllServers(),
  ['servers', 'all'],
  { revalidate: 60 },
);

export const getCachedServerByGuildId = unstable_cache(
  async (id: string) => getServerByGuildId(id),
  ['servers', 'by-guild-id'],
  { revalidate: 60 },
);

export const getCachedServerWithFavorited = unstable_cache(
  async (userId: string | undefined, id: string) =>
    getServerWithFavoritedByGuildId(userId, id),
  ['servers', 'with-favorited'],
  { revalidate: 60 },
);

// bot cache

export const getCachedAllBots = unstable_cache(
  async () => {
    return await getAllBots();
  },
  ['bots-all-approved'], // 快取鍵
  {
    revalidate: 300, // 5 分鐘後重新驗證
    tags: ['bots', 'all-bots'], // 標籤，用於有選擇性地清除快取
  },
);

// 快取單個 bot 資料，快取 1 分鐘
export const getCachedBot = unstable_cache(
  async (id: string) => {
    return await getBot(id);
  },
  ['bot-detail'], // 快取鍵前綴
  {
    revalidate: 60, // 1 分鐘後重新驗證
    tags: ['bots', 'bot-detail'], // 標籤
  },
);

// 快取用戶投票資料（較短的快取時間，因為更新頻繁）
export const getCachedUserVotes = unstable_cache(
  async (userId: string, botIds: string[]) => {
    return await getUserVotesForBots(userId, botIds);
  },
  ['user-votes'], // 快取鍵前綴
  {
    revalidate: 60, // 1 分鐘後重新驗證
    tags: ['votes', 'user-votes'],
  },
);

export function hasAdministratorPermission(permissions: string): boolean {
  const ADMINISTRATOR = 0x00000008; // 管理員權限
  const perms = BigInt(permissions);
  return (perms & BigInt(ADMINISTRATOR)) === BigInt(ADMINISTRATOR);
}

export function extractPermissionsFromInviteUrl(url: string): string | null {
  const parsedUrl = new URL(url);
  const permissions = parsedUrl.searchParams.get('permissions');
  return permissions;
}

export function createPriorityCalculator(options?: {
  voteWeight?: number;
  serverWeight?: number;
  maxScore?: number;
}) {
  const voteWeight = options?.voteWeight ?? 0.7;
  const serverWeight = options?.serverWeight ?? 0.3;

  return function calculatePriority(input: PriorityInput, maxScore: number) {
    const upvotes = input.upvotes || 0;
    const servers = input.servers || 0;

    const score = upvotes * voteWeight + servers * serverWeight;

    const priority = 0.5 + (score / maxScore) * 0.5;

    return Math.min(1.0, Math.max(0.5, Number(priority.toFixed(2))));
  };
}

export function getCookie(name: string): string | undefined {
  const value = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1];
  return value ? decodeURIComponent(value) : undefined;
}

export const fetchBotInfo = async (client_id: string) => {
  const baseUrl = GetbaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/proxy/rpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error ||
          `找不到此 Bot 或 Discord API 錯誤 (status: ${res.status})`,
      );
    }

    const rpcData: DiscordBotRPCInfo = await res.json();

    // 確保在客戶端執行
    if (typeof window !== 'undefined') {
      const info = await fetchUserInfo(client_id);
      return { rpcData, info };
    }

    return { rpcData };
  } catch (error) {
    console.error('Bot info fetch failed:', error);
    throw error;
  }
};

export async function getBotGuildIds(): Promise<string[]> {
  const token = process.env.BOT_TOKEN;

  const res = await fetch('https://discord.com/api/v10/users/@me/guilds', {
    headers: {
      Authorization: `Bot ${token}`,
    },
  });

  if (!res.ok) {
    console.error(await res.text());
    throw new Error('Failed to fetch guilds from Discord');
  }

  const guilds = await res.json();
  return guilds.map((g: any) => g.id);
}

export function getRandomEmbedColor(): number {
  return Math.floor(Math.random() * 0xffffff);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Simplify<T> = {
  [KeyType in keyof T]: T[KeyType];
} & {};

export async function fetchUserInfo(id: string): Promise<UserProfile> {
  try {
    const data = await getDiscordMember(id);

    if (!data) {
      throw new Error(`Failed to fetch user info for ID ${id}: `);
    }

    return data;
  } catch (error) {
    console.error('fetchUserInfo error:', error);
    throw error;
  }
}

export interface DiscordToken {
  accessToken: string | undefined;
  refreshToken: string | null;
  accessTokenExpires: number; // 毫秒时间戳
  error?: string;
  [key: string]: any; // 保留扩展字段（例如 NextAuth 默认附加的东西）
}

// 刷新 accessToken 方法
export async function refreshAccessToken(
  token: DiscordToken,
): Promise<DiscordToken> {
  try {
    // 检查是否有 refresh token
    if (!token.refreshToken) {
      console.log('No refresh token available');
      return {
        ...token,
        error: 'NoRefreshToken',
      };
    }

    const url = 'https://discord.com/api/oauth2/token';
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken,
    });

    const response = await fetch(url, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      console.error('Failed to refresh token:', {
        status: response.status,
        statusText: response.statusText,
        error: refreshedTokens,
      });

      // invalid_grant 表示 refresh token 无效，需要重新登录
      if (refreshedTokens.error === 'invalid_grant') {
        console.log('Refresh token invalid, user needs to re-authenticate');
        return {
          ...token,
          accessToken: undefined,
          refreshToken: null,
          accessTokenExpires: 0,
          error: 'RefreshAccessTokenError',
        };
      }

      return {
        ...token,
        error: 'RefreshAccessTokenError',
      };
    }

    console.log('Token refreshed successfully');
    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token || token.refreshToken,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      error: undefined, // 清除错误状态
    };
  } catch (error) {
    console.error('Exception while refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}
