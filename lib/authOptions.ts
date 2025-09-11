import { NextAuthOptions } from 'next-auth';
import { JWTDiscordProfile, NewDiscordProfile } from '@/app/types/next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { upsertUserFromSession } from '@/lib/actions/user';
import { DiscordToken } from '@/lib/utils';
import { JWT } from 'next-auth/jwt';

const CLIENT_ID = process.env.DISCORD_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET ?? '';

async function refreshAccessTokenViaAPI(
  token: DiscordToken,
): Promise<DiscordToken> {
  const res = await fetch('https://discord.com/api/v10/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
    },
    cache: 'no-store',
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken || '',
    }),
  });

  // API 會回完整的 DiscordToken（含 error / accessTokenExpires）
  if (!res.ok) {
    throw new Error(`Refresh failed with status ${res.status}`);
  }
  return (await res.json()) as DiscordToken;
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
      const now = Date.now();
      const bufferTime = 5 * 60 * 1000; // 5 分鐘

      if (profile && account?.provider === 'discord') {
        const discordProfile = profile as JWTDiscordProfile;

        token.discordProfile = discordProfile;
        token.accessToken = account.access_token ?? undefined;
        token.refreshToken = account.refresh_token ?? null;

        if (typeof account.expires_in === 'number') {
          token.accessTokenExpires = now + account.expires_in * 1000;
        } else {
          token.accessTokenExpires = now + 3600 * 1000; // 預設 1 小時
        }

        upsertUserFromSession(discordProfile);
        return token;
      }

      // 若 access token 還沒接近過期，就直接用
      if (
        typeof token.accessTokenExpires === 'number' &&
        now < token.accessTokenExpires - bufferTime
      ) {
        return token;
      }

      // 沒有 refresh token，無法刷新
      if (!token.refreshToken) {
        return {
          ...token,
          error: 'NoRefreshToken',
        };
      }

      // 透過你新的 API 刷新
      try {
        const updated = await refreshAccessTokenViaAPI(token as DiscordToken);
        return updated as JWT;
      } catch (e) {
        return {
          ...token,
          error: 'RefreshAccessTokenError',
        };
      }
    },

    async session({ session, token }) {
      if (token && token.discordProfile) {
        session.access_token = token.accessToken;
        session.discordProfile = token.discordProfile;
        if (token.error) {
          session.error = token.error;
          session.user = undefined;
        }
      }
      return session;
    },
  },
};
