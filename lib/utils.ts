import { JWTDiscordProfile, NewDiscordProfile } from '@/app/types/next-auth';
import { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Simplify<T> = {
  [KeyType in keyof T]: T[KeyType];
} & {};

export async function fetchUserInfo(id: string) {
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
        console.log('profile', profile);
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
      }
      return session;
    },
  },
};
