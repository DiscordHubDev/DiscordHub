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

export type PriorityInput = {
  upvotes?: number;
  servers?: number;
};

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
  try {
    const res = await fetch('/api/rpc', {
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

export async function refreshAccessToken(token: any) {
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
          accessToken: null,
          refreshToken: null,
          accessTokenExpires: 0,
          error: 'RefreshAccessTokenError',
        };
      }

      // 其他错误也标记为需要重新认证
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
