// zod

import { botFormSchema } from '@/schemas/add-bot-schema';
import { z } from 'zod';

export type BotFormData = z.infer<typeof botFormSchema>;

export interface CategoryType {
  id: string;
  name: string;
  color: string;
  selected: boolean;
}

export type UploadedFile = {
  url: string;
  public_id: string;
  format: string;
  type: 'image' | 'video' | 'raw';
  original_filename: string;
};

export type Screenshot = {
  url: string;
  public_id: string;
};

export interface BotType {
  id: string;
  name: string;
  description: string;
  tags: string[];
  servers: number;
  users: number;
  upvotes: number;
  icon?: string;
  banner?: string;
  featured: boolean;
  createdAt: string;
  prefix?: string;
  developers?: string[];
  website?: string;
  inviteUrl?: string;
  supportServer?: string;
  verified: boolean;
  discord_verified: boolean;
  longDescription?: string;
  commands?: BotCommand[];
  features?: string[];
  screenshots?: string[];
}

interface BotCommand {
  name: string;
  description: string;
  usage: string;
  category?: string;
}

export type Mail = {
  id: string;
  name: string;
  createdAt: string;
  subject: string;
  content: string;
  teaser: string;
  userId?: bigint | null;
  priority: EmailPriority;
  isSystem: boolean;
  read: boolean;
};

export type EmailPriority = 'success' | 'info' | 'warning' | 'danger';

// types/discord.ts
export type DiscordBotRPCInfo = {
  id: string;
  name: string;
  icon: string | null;
  description: string;
  summary: string;
  type: null;
  is_monetized: boolean;
  is_verified: boolean;
  is_discoverable: boolean;
  hook: boolean;
  guild_id: string;
  storefront_available: boolean;
  bot_public: boolean;
  bot_require_code_grant: boolean;
  terms_of_service_url: string | null;
  privacy_policy_url: string | null;
  install_params: {
    scopes: string[];
    permissions: string;
  };
  verify_key: string;
  flags: number;
  tags: string[];
};

export type BotInfo = {
  username: string;
  global_name: string;
  avatar_url: string;
  banner_url: string;
  accent_color: string;
};
