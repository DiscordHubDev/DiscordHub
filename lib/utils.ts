import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UserProfile } from './types';
export type PriorityInput = {
  upvotes?: number;
  servers?: number;
};

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
  const res = await fetch(`https://dchub.mantou.dev/member/${id}`);

  if (!res.ok) {
    throw new Error(
      `Failed to fetch user info for ID ${id}: ${res.statusText}`,
    );
  }

  const data = await res.json();
  return data;
}

export async function refreshAccessToken(token: any) {
  try {
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
      console.error(
        'Failed to refresh token: Discord responded with error',
        refreshedTokens,
      );

      if (refreshedTokens.error === 'invalid_grant') {
        return {
          ...token,
          accessToken: null,
          refreshToken: null,
          accessTokenExpires: 0,
          error: 'RefreshAccessTokenError',
        };
      }

      throw new Error('Unexpected error from Discord while refreshing token');
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token, // 更新為新 refresh token
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
    };
  } catch (error) {
    console.error('Exception while refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}
