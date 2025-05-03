import { JWTDiscordProfile, NewDiscordProfile } from '@/app/types/next-auth';
import { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UserProfile } from './types';
import { upsertUserFromSession } from './actions/user';

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

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider<NewDiscordProfile>({
      authorization: {
        params: {
          scope: 'identify guilds email',
        },
      },
      clientId: process.env.DISCORD_CLIENT_ID ?? '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? '',
      profile: profile => {
        if (profile.avatar === null) {
          const defaultAvatarNumber = parseInt(profile.discriminator) % 5;
          profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
        } else {
          const format = profile.avatar.startsWith('a_') ? 'gif' : 'png';
          profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
        }

        profile.banner_url = profile.banner
          ? `https://cdn.discordapp.com/banners/${profile.id}/${profile.banner}.png?size=4096`
          : null;

        return {
          ...profile,
          global_name: profile.global_name,
          name: profile.username,
          image: profile.image_url,
          banner: profile.banner_url,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt: async ({ token, account, profile }) => {
      if (profile && account?.provider === 'discord') {
        token.discordProfile = profile as JWTDiscordProfile;
        token.accessToken = account.access_token;
        token.maxAge = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && token.discordProfile) {
        session.access_token = token.accessToken;
        session.discordProfile = token.discordProfile;
        upsertUserFromSession(session);
      }
      return session;
    },
  },
};
