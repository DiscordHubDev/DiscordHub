import NextAuth, { DefaultSession } from "next-auth";
import { DiscordProfile } from "next-auth/providers/discord";

import { Profile } from "next-auth";

interface NewDiscordProfile extends DiscordProfile {
  global_name?: string | null | undefined;
}

interface JWTDiscordProfile extends Profile {
  global_name?: string | null | undefined;
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
    image_url: string;
    locale: string;
    mfa_enabled: boolean;
    premium_type: number;
    public_flags: number;
    username: string;
    verified: boolean;
  }
}
