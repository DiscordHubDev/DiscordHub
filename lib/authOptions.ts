import { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { NewDiscordProfile, JWTDiscordProfile } from '@/app/types/next-auth';
import { upsertUserFromSession } from '@/lib/actions/user';

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
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        token.discordProfile = user as JWTDiscordProfile;
        token.accessToken = account.access_token;
      }
      try {
        await upsertUserFromSession(user as JWTDiscordProfile);
      } catch (error) {
        console.error('Failed to upsert user:', error);
      }
      return token;
    },

    async session({ session, token }) {
      if (token.discordProfile) {
        session.discordProfile = token.discordProfile as JWTDiscordProfile;
        session.access_token = token.accessToken as string;
      }

      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'discord' && profile) {
        console.log('User signed in via Discord:', user.email);
      }
    },
  },
};
