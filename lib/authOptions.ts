import { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { NewDiscordProfile, JWTDiscordProfile } from '@/app/types/next-auth';
import { upsertUserFromSession } from '@/lib/actions/user';

/**
 * 刷新 Discord access token
 */
async function refreshAccessToken(token: any) {
  try {
    const url = 'https://discord.com/api/oauth2/token';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider<NewDiscordProfile>({
      authorization: {
        params: {
          scope: 'identify guilds email',
        },
      },
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      profile(profile): JWTDiscordProfile {
        let image_url: string;
        if (profile.avatar === null) {
          const defaultAvatarNumber = parseInt(profile.discriminator) % 5;
          image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
        } else {
          const format = profile.avatar.startsWith('a_') ? 'gif' : 'png';
          image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
        }

        // 橫幅 URL
        const banner_url = profile.banner
          ? `https://cdn.discordapp.com/banners/${profile.id}/${profile.banner}.png?size=4096`
          : null;

        return {
          ...profile,
          global_name: profile.global_name,
          name: profile.username,
          image_url: image_url,
          avatar: image_url,
          banner_url: banner_url,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // 初次登入時儲存 token 資訊
      if (account && user) {
        token.discordProfile = user as JWTDiscordProfile;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;

        const expiresIn =
          typeof account.expires_in === 'number' ? account.expires_in : 604800;

        token.accessTokenExpires = Date.now() + expiresIn * 1000;

        try {
          await upsertUserFromSession(user as JWTDiscordProfile);
        } catch (error) {
          console.error('Failed to upsert user:', error);
        }

        return token;
      }

      const shouldRefresh =
        Date.now() > (token.accessTokenExpires as number) - 5 * 60 * 1000;

      if (shouldRefresh && token.refreshToken) {
        console.log('Access token expired, refreshing...');
        return refreshAccessToken(token);
      }

      return token;
    },

    async session({ session, token }) {
      if (token.discordProfile) {
        session.discordProfile = token.discordProfile as JWTDiscordProfile;
        session.access_token = token.accessToken as string;
      }

      if (token.error) {
        session.error = token.error as string;
      }

      return session;
    },
  },
};
