import pLimit from 'p-limit';
import { getCache, setCache } from './cache';
import {
  addServerAdmin,
  bulkInsertServerAdmins,
  getPublishedServerMap,
  getServerByGuildId,
} from './actions/servers';
import { prisma } from './prisma';

const limit = pLimit(10); // 同時處理最多 10 個伺服器

const BOT_TOKEN = process.env.BOT_TOKEN;
const DISCORD_GUILDS_ENDPOINT =
  'https://discord.com/api/users/@me/guilds?with_counts=true';

const REQUIRED_PERMISSIONS = BigInt(0x20 | 0x8); // MANAGE_GUILD | ADMINISTRATOR

// ----------------- 型別 ------------------

type BaseServerInfo = {
  id: string;
  name: string;
  icon: string;
  banner: string;
  isInServer: boolean;
};

export type ActiveServerInfo = BaseServerInfo & {
  owner: string;
  memberCount: number;
  OnlineMemberCount: number;
  isPublished: boolean;
  admins: string[];
};

export type InactiveServerInfo = BaseServerInfo & {
  isPublished: boolean;
};

export type ServerInfo = ActiveServerInfo | InactiveServerInfo;

export type MinimalServerInfo = {
  id: string;
  name: string;
  icon: string;
  banner: string;
  memberCount: number;
  isInServer: boolean;
  isPublished: boolean;
};

type DiscordGuild = {
  id: string;
  name: string;
  icon: string | null;
  approximate_member_count: number | null;
  banner: string | null;
  permissions: number;
};

// ----------------- 工具函式 ------------------

const hasManageGuildPermission = (
  permissions: string | number | bigint,
): boolean => {
  const perms = BigInt(permissions);
  return (perms & REQUIRED_PERMISSIONS) !== BigInt(0);
};

function getDiscordImageUrl(
  type: 'icon' | 'banner',
  id: string,
  hash: string | null,
): string {
  if (!hash) return '';
  const ext = hash.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/${type === 'icon' ? 'icons' : 'banners'}/${id}/${hash}.${ext}?size=1024`;
}

async function safeFetchWithRateLimit(
  url: string,
  options: RequestInit,
  retryCount = 0,
): Promise<Response> {
  const MAX_RETRIES = 5;

  const res = await fetch(url, options);
  if (res.status === 429) {
    if (retryCount >= MAX_RETRIES) {
      throw new Error(`Rate limit hit too many times for ${url}`);
    }

    const data = await res.json();
    const retryAfter = data.retry_after || 1;
    console.warn(`${url} Rate limited. Retrying after ${retryAfter}s`);
    await new Promise(resolve =>
      setTimeout(resolve, retryAfter * 1000 * Math.random() + 500),
    );
    return safeFetchWithRateLimit(url, options, retryCount + 1);
  }

  return res;
}

// ----------------- 主要函式 ------------------

export async function getGuildDetails(
  guildId: string,
): Promise<ActiveServerInfo | null> {
  const cacheKey = `guild:details:${guildId}`;

  console.time(`⏱ fetch:details-${guildId}`);
  const res = await safeFetchWithRateLimit(
    `https://discord.com/api/guilds/${guildId}?with_counts=true`,
    {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
      },
    },
  );
  console.timeEnd(`⏱ fetch:details-${guildId}`);

  if (!res.ok) return null;

  const data = await res.json();

  const guildInfo: ActiveServerInfo = {
    id: data.id,
    name: data.name,
    icon: getDiscordImageUrl('icon', data.id, data.icon),
    banner: getDiscordImageUrl('banner', data.id, data.banner),
    owner: data.owner_id,
    memberCount: data.approximate_member_count ?? 0,
    OnlineMemberCount: data.approximate_presence_count ?? 0,
    admins: [],
    isInServer: true,
    isPublished: false,
  };

  await setCache(cacheKey, guildInfo, 300);

  return guildInfo;
}

export async function getUserGuildsWithBotStatus(
  accessToken: string,
  userId: string,
): Promise<{
  activeServers: MinimalServerInfo[];
  inactiveServers: MinimalServerInfo[];
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    console.warn(`⚠️ User ${userId} 不存在，跳過流程`);
    return {
      activeServers: [],
      inactiveServers: [],
    };
  }

  const userGuildsRes = await safeFetchWithRateLimit(DISCORD_GUILDS_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userGuildsRes.ok) {
    const message = await userGuildsRes.text();
    throw new Error(`Failed to fetch user guilds: ${message}`, {
      cause: userGuildsRes,
    });
  }

  const userGuilds: DiscordGuild[] = await userGuildsRes.json();
  const manageableGuilds = userGuilds.filter(g =>
    hasManageGuildPermission(g.permissions),
  );

  const botGuildsRes = await safeFetchWithRateLimit(DISCORD_GUILDS_ENDPOINT, {
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
    },
  });

  if (!botGuildsRes.ok) {
    throw new Error('Failed to fetch bot guilds');
  }

  const botGuilds: DiscordGuild[] = await botGuildsRes.json();
  const botGuildIdSet = new Set(botGuilds.map(g => g.id));

  const activeServers: MinimalServerInfo[] = [];
  const inactiveServers: MinimalServerInfo[] = [];
  const serverAdminPairs: { serverId: string; userId: string }[] = [];

  const guildIds = manageableGuilds.map(g => g.id);
  const publishedGuildSet = await getPublishedServerMap(guildIds);

  await Promise.all(
    manageableGuilds.map(guild =>
      limit(async () => {
        try {
          const isInServer = botGuildIdSet.has(guild.id);
          const isPublished = publishedGuildSet.has(guild.id);

          const basic: MinimalServerInfo = {
            id: guild.id,
            name: guild.name,
            icon: getDiscordImageUrl('icon', guild.id, guild.icon),
            banner: getDiscordImageUrl('banner', guild.id, guild.banner),
            memberCount: guild.approximate_member_count ?? 0,
            isInServer,
            isPublished,
          };

          if (isPublished) {
            serverAdminPairs.push({ serverId: guild.id, userId });
          }

          if (isInServer) {
            activeServers.push(basic);
          } else {
            inactiveServers.push(basic);
          }
        } catch (err) {
          console.error(`Error handling guild ${guild.id}`, err);
        }
      }),
    ),
  );

  await bulkInsertServerAdmins(serverAdminPairs);

  return {
    activeServers,
    inactiveServers,
  };
}
