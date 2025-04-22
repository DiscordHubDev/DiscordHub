import pLimit from 'p-limit';
import { getCache, setCache } from './cache';
import { addServerAdmin, getServerByGuildId } from './actions/servers';

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
  return (BigInt(permissions) & BigInt(0x20)) === BigInt(0x20);
};

async function getGuildDetailsWithCache(
  guildId: string,
): Promise<ActiveServerInfo | null> {
  const cacheKey = `guild:details:${guildId}`;

  const cached = await getCache<ActiveServerInfo>(cacheKey);
  if (cached) return cached;

  try {
    const details = await getGuildDetails(guildId);

    console.log(`getGuildDetailsWithCache(${guildId}) details`, details);

    if (details) {
      await setCache(cacheKey, details, 300);
    }

    return details;
  } catch (error) {
    console.warn(`❌ getGuildDetailsWithCache(${guildId}) 發生錯誤：`, error);
    return null;
  }
}

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
  // 拉使用者有管理權限的 guilds
  const userGuildsRes = await safeFetchWithRateLimit(
    'https://discord.com/api/users/@me/guilds?with_counts=true',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!userGuildsRes.ok) throw new Error('Failed to fetch user guilds');
  const userGuilds: DiscordGuild[] = await userGuildsRes.json();

  const manageableGuilds = userGuilds.filter(g =>
    hasManageGuildPermission(g.permissions),
  );

  // 拉 bot 加入的 guilds
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

  await Promise.all(
    manageableGuilds.map(guild =>
      limit(async () => {
        const isInServer = botGuildIdSet.has(guild.id);
        const isPublished = await getServerByGuildId(guild.id).then(Boolean);
        const banner = guild.banner;

        const basic: MinimalServerInfo = {
          id: guild.id,
          name: guild.name,
          icon: guild.icon
            ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
            : '',
          banner: banner
            ? `https://cdn.discordapp.com/banners/${guild.id}/${banner}.${banner.startsWith('a_') ? 'gif' : 'png'}?size=1024`
            : '',
          memberCount: guild.approximate_member_count ?? 0,
          isInServer,
          isPublished,
        };

        await addServerAdmin(basic, userId);

        if (isInServer) {
          activeServers.push(basic);
        } else {
          inactiveServers.push(basic);
        }
      }),
    ),
  );

  return {
    activeServers,
    inactiveServers,
  };
}
