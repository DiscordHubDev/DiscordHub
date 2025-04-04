import NextAuth, { DefaultSession } from "next-auth";
import { DiscordProfile } from "next-auth/providers/discord";

import { Profile } from "next-auth";

interface NewDiscordProfile extends DiscordProfile {
  global_name: string;
}

interface JWTDiscordProfile extends Profile {
  global_name: string;
}

declare module "next-auth/jwt" {
  interface JWT {
    maxAge?: number;
    accessToken?: string;
    discordProfile?: JWTDiscordProfile;
  }
}

declare module "next-auth" {
  interface Session {
    access_token?: string;
    discordProfile?: JWTDiscordProfile;
  }

  interface Profile {
    accent_color: number;
    avatar: string;
    banner: string;
    banner_color: string;
    discriminator: string;
    email: string;
    flags: number;
    id: string;
    image: string;
    image_url: string;
    banner_url: string?;
    locale: string;
    mfa_enabled: boolean;
    premium_type: number;
    public_flags: number;
    username: string;
    verified: boolean;
  }
}
