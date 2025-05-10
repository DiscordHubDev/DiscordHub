import { NextAuthOptions } from 'next-auth';
import { JWTDiscordProfile, NewDiscordProfile } from '@/app/types/next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { upsertUserFromSession } from '@/lib/actions/user';
import { refreshAccessToken } from '@/lib/utils';

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

      if (profile && account?.provider === 'discord') {
        const discordProfile = profile as JWTDiscordProfile;

        token.discordProfile = discordProfile;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;

        if (typeof account.expires_in === 'number') {
          token.accessTokenExpires = now + account.expires_in * 1000;
        } else {
          token.accessTokenExpires = now + 3600 * 1000; // 預設 1 小時
        }

        upsertUserFromSession(discordProfile);
        return token;
      }

      if (
        typeof token.accessTokenExpires === 'number' &&
        now < token.accessTokenExpires
      ) {
        return token;
      }

      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token && token.discordProfile) {
        session.access_token = token.accessToken;
        session.discordProfile = token.discordProfile;
        if (token.error) {
          session.error = token.error; // 這是重點
          session.user = undefined;
        }
      }
      return session;
    },
  },
};
