import pLimit from 'p-limit';
import { getCache, setCache } from './cache';
import {
  addServerAdmin,
  bulkInsertServerAdmins,
  getPublishedServerMap,
  getServerByGuildId,
} from './actions/servers';
import { prisma } from './prisma';

const limit = pLimit(10); // 同時處理最多 5 個伺服器

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

const BOT_TOKEN = process.env.BOT_TOKEN;

const hasManageGuildPermission = (permissions: string | number | bigint) => {
  const perms = BigInt(permissions);
  const MANAGE_GUILD = BigInt(0x20);
  const ADMINISTRATOR = BigInt(0x8);

  return (perms & (MANAGE_GUILD | ADMINISTRATOR)) !== BigInt(0);
};

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

  if (!res.ok) {
    return null;
  }

  const data = await res.json();

  const guildInfo: ActiveServerInfo = {
    id: data.id,
    name: data.name,
    icon: data.icon
      ? `https://cdn.discordapp.com/icons/${data.id}/${data.icon}.png`
      : '',
    banner: data.banner
      ? `https://cdn.discordapp.com/banners/${data.id}/${data.banner}.png`
      : '',
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

async function safeFetchWithRateLimit(
  url: string,
  options: RequestInit,
): Promise<Response> {
  const res = await fetch(url, options);
  if (res.status === 429) {
    const data = await res.json();
    const retryAfter = data.retry_after || 1;
    console.warn(`${url} Rate limited. Retrying after ${retryAfter}s`);
    await new Promise(resolve =>
      setTimeout(resolve, retryAfter * 1000 * Math.random() + 500),
    );
    return safeFetchWithRateLimit(url, options); // 重试
  }
  return res;
}

export async function getUserGuildsWithBotStatus(
  accessToken: string,
  userId: string,
): Promise<{
  activeServers: MinimalServerInfo[];
  inactiveServers: MinimalServerInfo[];
}> {
  // 先確認 user 是否存在
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

  // 取得使用者有管理權限的 guilds
  const userGuildsRes = await safeFetchWithRateLimit(
    'https://discord.com/api/users/@me/guilds?with_counts=true',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

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

  // 取得 bot 所在的 guilds
  const botGuildsRes = await safeFetchWithRateLimit(
    'https://discord.com/api/users/@me/guilds?with_counts=true',
    {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
      },
    },
  );

  if (!botGuildsRes.ok) throw new Error('Failed to fetch bot guilds');

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
        const isInServer = botGuildIdSet.has(guild.id);
        const isPublished = publishedGuildSet.has(guild.id);

        const basic: MinimalServerInfo = {
          id: guild.id,
          name: guild.name,
          icon: guild.icon
            ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
            : '',
          banner: guild.banner
            ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.${guild.banner.startsWith('a_') ? 'gif' : 'png'}?size=1024`
            : '',
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
      }),
    ),
  );

  await bulkInsertServerAdmins(serverAdminPairs);

  return {
    activeServers,
    inactiveServers,
  };
}
