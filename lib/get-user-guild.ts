import pLimit from 'p-limit';
import { getCache, setCache } from './cache';
import {
  bulkInsertServerAdmins,
  getPublishedServerMap,
} from './actions/servers';
import { prisma } from './prisma';

// --- 常數定義 ---
const DISCORD_API_BASE_URL = 'https://discord.com/api/v10';
const BOT_GUILDS_CACHE_KEY = 'cache:bot-guilds';
const BOT_GUILDS_CACHE_TTL_SECONDS = 300; // Bot伺服器列表快取5分鐘
const USER_GUILDS_RESULT_CACHE_TTL_SECONDS = 90; // 使用者結果快取90秒

// Type definitions (與之前相同)
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
  banner: string | null;
  permissions: string;
  approximate_member_count?: number;
};

type CachedUserGuildsResult = {
  activeServers: MinimalServerInfo[];
  inactiveServers: MinimalServerInfo[];
};

const BOT_TOKEN = process.env.BOT_TOKEN;

// --- 輔助函式 (與之前相似，但保持精簡) ---

const hasManageGuildPermission = (permissions: string): boolean => {
  const perms = BigInt(permissions);
  return (perms & (BigInt(0x20) | BigInt(0x8))) !== BigInt(0);
};

async function safeFetch(url: string, options: RequestInit): Promise<Response> {
  // ... (safeFetch 邏輯與之前相同，此處省略以保持簡潔)
  const res = await fetch(url, options);
  if (res.status === 429) {
    const data = await res.json();
    const retryAfter = (data.retry_after || 1) * 1000;
    console.warn(`Rate limited. Retrying after ${retryAfter}ms...`);
    await new Promise(resolve => setTimeout(resolve, retryAfter + 500));
    return safeFetch(url, options);
  }
  return res;
}

async function getBotGuildIds(): Promise<Set<string>> {
  const cachedData = await getCache<string[]>(BOT_GUILDS_CACHE_KEY);
  if (cachedData) return new Set(cachedData);

  const res = await safeFetch(`${DISCORD_API_BASE_URL}/users/@me/guilds`, {
    headers: { Authorization: `Bot ${BOT_TOKEN}` },
  });
  if (!res.ok) {
    console.error('Fatal: Failed to fetch bot guilds:', await res.text());
    return new Set();
  }
  const botGuilds: { id: string }[] = await res.json();
  const guildIds = botGuilds.map(g => g.id);
  await setCache(BOT_GUILDS_CACHE_KEY, guildIds, BOT_GUILDS_CACHE_TTL_SECONDS);
  return new Set(guildIds);
}

// --- 核心優化函式 ---

export async function getUserGuildsWithBotStatus(
  accessToken: string,
  userId: string,
): Promise<CachedUserGuildsResult> {
  // 1. 【極速路徑】嘗試從結果快取中直接讀取
  const resultCacheKey = `user-guilds:${userId}`;
  const cachedResult = await getCache<CachedUserGuildsResult>(resultCacheKey);
  if (cachedResult) {
    console.log(`⚡️ Cache HIT for user ${userId}. Serving from result cache.`);
    return cachedResult;
  }

  // 2. 【慢速路徑】快取未命中，執行完整流程
  console.log(`🐢 Cache MISS for user ${userId}. Fetching fresh data.`);

  // 檢查使用者是否存在
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) {
    console.warn(`⚠️ User ${userId} does not exist. Skipping.`);
    return { activeServers: [], inactiveServers: [] };
  }

  // 併發獲取 Discord API 資料
  const [userGuildsRes, botGuildIdSet] = await Promise.all([
    safeFetch(`${DISCORD_API_BASE_URL}/users/@me/guilds?with_counts=true`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
    getBotGuildIds(),
  ]);

  if (!userGuildsRes.ok) {
    throw new Error(
      `Failed to fetch user guilds: ${await userGuildsRes.text()}`,
    );
  }

  const userGuilds: DiscordGuild[] = await userGuildsRes.json();
  const manageableGuilds = userGuilds.filter(g =>
    hasManageGuildPermission(g.permissions),
  );
  const manageableGuildIds = manageableGuilds.map(g => g.id);

  // 獲取已發布的伺服器狀態
  const publishedGuildSet = await getPublishedServerMap(manageableGuildIds);
  const serverAdminPairs: { serverId: string; userId: string }[] = [];

  // 使用單一 reduce 處理所有邏輯，效率最高
  const result: CachedUserGuildsResult = manageableGuilds.reduce(
    (acc, guild) => {
      const isInServer = botGuildIdSet.has(guild.id);
      const isPublished = publishedGuildSet.has(guild.id);

      const serverInfo: MinimalServerInfo = {
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
        acc.activeServers.push(serverInfo);
      } else {
        acc.inactiveServers.push(serverInfo);
      }
      return acc;
    },
    {
      activeServers: [] as MinimalServerInfo[],
      inactiveServers: [] as MinimalServerInfo[],
    },
  );

  // 3. 【非阻塞寫入】執行資料庫更新，但不等待它完成
  if (serverAdminPairs.length > 0) {
    bulkInsertServerAdmins(serverAdminPairs).catch(err => {
      // 在背景中處理錯誤，避免主程序崩潰
      console.error(
        `Failed to bulk insert server admins for user ${userId}:`,
        err,
      );
    });
  }

  // 4. 【寫入快取】將最終結果存入快取，供下次使用
  await setCache(resultCacheKey, result, USER_GUILDS_RESULT_CACHE_TTL_SECONDS);

  // 5. 回傳結果
  return result;
}
