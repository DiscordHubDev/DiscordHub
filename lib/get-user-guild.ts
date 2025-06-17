import pLimit from 'p-limit';
import { getCache, setCache } from './cache';
import {
  bulkInsertServerAdmins,
  getPublishedServerMap,
} from './actions/servers';
import { prisma } from './prisma';

// ==================== 常數定義 ====================
const LIMITS = {
  CONCURRENT_REQUESTS: 50,
  DETAILED_REQUESTS: 25,
  MAX_RETRIES: 3,
  BASE_DELAY: 100,
  TIMEOUT: 8000,
  BATCH_DELAY: 10,
  CACHE_TTL: 600,
  IMAGE_SIZE: 512,
} as const;

const ENDPOINTS = {
  DISCORD_GUILDS: 'https://discord.com/api/users/@me/guilds?with_counts=true',
  DISCORD_GUILD_DETAIL: (id: string) =>
    `https://discord.com/api/guilds/${id}?with_counts=true`,
  DISCORD_CDN: (
    type: 'icons' | 'banners',
    id: string,
    hash: string,
    ext: string,
  ) =>
    `https://cdn.discordapp.com/${type}/${id}/${hash}.${ext}?size=${LIMITS.IMAGE_SIZE}`,
} as const;

const PERMISSIONS = {
  REQUIRED: BigInt(0x20 | 0x8), // MANAGE_GUILD | ADMINISTRATOR
} as const;

// ==================== 並行控制 ====================
const limit = pLimit(LIMITS.CONCURRENT_REQUESTS);
const detailLimit = pLimit(LIMITS.DETAILED_REQUESTS);

// ==================== 環境變數 ====================
const BOT_TOKEN = process.env.BOT_TOKEN!;
if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN environment variable is required');
}

// ==================== 型別定義 ====================
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

type CacheEntry = {
  data: any;
  ttl: number;
};

type ServerAdminPair = {
  serverId: string;
  userId: string;
};

// ==================== 批次快取管理器優化 ====================
class CacheManager {
  private static readonly pendingGets = new Map<string, Promise<any>>();
  private static readonly pendingSets = new Map<string, CacheEntry>();
  private static batchTimeout: NodeJS.Timeout | null = null;

  static async batchGet(keys: string[]): Promise<Map<string, any>> {
    if (keys.length === 0) return new Map();

    const results = new Map<string, any>();
    const uniqueKeys = [...new Set(keys)]; // 去重

    // 批次並行處理，避免重複請求
    const promises = uniqueKeys.map(async key => {
      if (this.pendingGets.has(key)) {
        return this.pendingGets.get(key);
      }

      const promise = this.getCacheValue(key);
      this.pendingGets.set(key, promise);

      try {
        const value = await promise;
        if (value !== null && value !== undefined) {
          results.set(key, value);
        }
      } finally {
        this.pendingGets.delete(key);
      }
    });

    await Promise.allSettled(promises);
    return results;
  }

  private static async getCacheValue(key: string): Promise<any> {
    try {
      return await getCache(key);
    } catch (error) {
      console.warn(`Cache get failed for ${key}:`, this.getErrorMessage(error));
      return null;
    }
  }

  static batchSet(
    key: string,
    data: any,
    ttl: number = LIMITS.CACHE_TTL,
  ): void {
    this.pendingSets.set(key, { data, ttl });
    this.scheduleBatchFlush();
  }

  private static scheduleBatchFlush(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.flushSets();
    }, LIMITS.BATCH_DELAY);
  }

  private static async flushSets(): Promise<void> {
    const entries = Array.from(this.pendingSets.entries());
    this.pendingSets.clear();
    this.batchTimeout = null;

    if (entries.length === 0) return;

    const promises = entries.map(([key, { data, ttl }]) =>
      setCache(key, data, ttl).catch(error =>
        console.warn(
          `Batch cache set failed for ${key}:`,
          this.getErrorMessage(error),
        ),
      ),
    );

    await Promise.allSettled(promises);
  }

  private static getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}

// ==================== 連線池管理器優化 ====================
class ConnectionPool {
  private static readonly config = {
    keepAlive: true,
    maxSockets: 50,
    timeout: LIMITS.TIMEOUT,
    keepAliveMsecs: 1000,
    maxFreeSockets: 10,
  };

  private static readonly agents = {
    user: new (require('https').Agent)(this.config),
    bot: new (require('https').Agent)(this.config),
  };

  static getUserAgent() {
    return this.agents.user;
  }

  static getBotAgent() {
    return this.agents.bot;
  }

  static cleanup(): void {
    Object.values(this.agents).forEach(agent => {
      agent.destroy();
    });
  }
}

// ==================== 工具函式優化 ====================
class Utils {
  static isValidActiveServerInfo(obj: any): obj is ActiveServerInfo {
    return (
      obj &&
      typeof obj === 'object' &&
      typeof obj.id === 'string' &&
      typeof obj.name === 'string' &&
      typeof obj.icon === 'string' &&
      typeof obj.banner === 'string' &&
      typeof obj.owner === 'string' &&
      typeof obj.memberCount === 'number' &&
      typeof obj.OnlineMemberCount === 'number' &&
      typeof obj.isInServer === 'boolean' &&
      typeof obj.isPublished === 'boolean' &&
      Array.isArray(obj.admins)
    );
  }

  static getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'Unknown error occurred';
  }

  static isNetworkError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;

    const networkErrorNames = ['AbortError', 'TypeError', 'TimeoutError'];
    return (
      networkErrorNames.includes(error.name) || error.message.includes('fetch')
    );
  }

  static hasManageGuildPermission(
    permissions: string | number | bigint,
  ): boolean {
    const perms = BigInt(permissions);
    return (perms & PERMISSIONS.REQUIRED) !== BigInt(0);
  }

  static getDiscordImageUrl(
    type: 'icon' | 'banner',
    id: string,
    hash: string | null,
  ): string {
    if (!hash) return '';

    const ext = hash.startsWith('a_') ? 'gif' : 'png';
    const cdnType = type === 'icon' ? 'icons' : 'banners';

    return ENDPOINTS.DISCORD_CDN(cdnType, id, hash, ext);
  }

  static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static sortByMemberCount<T extends { memberCount: number }>(items: T[]): T[] {
    return items.sort((a, b) => b.memberCount - a.memberCount);
  }
}

// ==================== 智慧重試機制優化 ====================
class RetryManager {
  static async smartFetchWithRetry(
    url: string,
    options: RequestInit,
    retryCount = 0,
    type: 'user' | 'bot' = 'bot',
  ): Promise<Response> {
    const enhancedOptions = {
      ...options,
      agent:
        type === 'user'
          ? ConnectionPool.getUserAgent()
          : ConnectionPool.getBotAgent(),
      timeout: LIMITS.TIMEOUT,
    };

    try {
      const response = await fetch(url, enhancedOptions);
      return await this.handleResponse(
        response,
        url,
        options,
        retryCount,
        type,
      );
    } catch (error) {
      return await this.handleError(error, url, options, retryCount, type);
    }
  }

  private static async handleResponse(
    response: Response,
    url: string,
    options: RequestInit,
    retryCount: number,
    type: 'user' | 'bot',
  ): Promise<Response> {
    if (response.status === 429) {
      return await this.handleRateLimit(
        response,
        url,
        options,
        retryCount,
        type,
      );
    }

    if (
      !response.ok &&
      response.status >= 500 &&
      retryCount < LIMITS.MAX_RETRIES
    ) {
      return await this.retryRequest(
        url,
        options,
        retryCount,
        type,
        `Server error ${response.status}`,
      );
    }

    return response;
  }

  private static async handleRateLimit(
    response: Response,
    url: string,
    options: RequestInit,
    retryCount: number,
    type: 'user' | 'bot',
  ): Promise<Response> {
    if (retryCount >= LIMITS.MAX_RETRIES) {
      console.warn(`⚠️ Max retries exceeded for ${url}`);
      throw new Error(`Rate limit exceeded for ${url}`);
    }

    const retryAfter = response.headers.get('retry-after');
    const delay = retryAfter
      ? parseInt(retryAfter) * 1000
      : this.calculateDelay(retryCount);

    console.log(
      `🔄 Rate limited. Retry ${retryCount + 1}/${LIMITS.MAX_RETRIES} after ${delay}ms`,
    );
    await Utils.delay(delay);
    return this.smartFetchWithRetry(url, options, retryCount + 1, type);
  }

  private static async handleError(
    error: unknown,
    url: string,
    options: RequestInit,
    retryCount: number,
    type: 'user' | 'bot',
  ): Promise<Response> {
    if (retryCount < LIMITS.MAX_RETRIES && Utils.isNetworkError(error)) {
      return await this.retryRequest(
        url,
        options,
        retryCount,
        type,
        Utils.getErrorMessage(error),
      );
    }
    throw error;
  }

  private static async retryRequest(
    url: string,
    options: RequestInit,
    retryCount: number,
    type: 'user' | 'bot',
    reason: string,
  ): Promise<Response> {
    const delay = this.calculateDelay(retryCount);
    console.log(
      `🔄 ${reason}. Retry ${retryCount + 1}/${LIMITS.MAX_RETRIES} after ${delay}ms`,
    );
    await Utils.delay(delay);
    return this.smartFetchWithRetry(url, options, retryCount + 1, type);
  }

  private static calculateDelay(retryCount: number): number {
    return LIMITS.BASE_DELAY * Math.pow(2, retryCount);
  }
}

// ==================== HTTP 請求工具 ====================
class HttpClient {
  static createHeaders(
    token: string,
    type: 'bot' | 'bearer',
  ): Record<string, string> {
    const authPrefix = type === 'bot' ? 'Bot' : 'Bearer';
    return {
      Authorization: `${authPrefix} ${token}`,
      'User-Agent': 'DiscordBot (https://discord.com, 1.0)',
      'Content-Type': 'application/json',
    };
  }

  static async fetchUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
    const response = await RetryManager.smartFetchWithRetry(
      ENDPOINTS.DISCORD_GUILDS,
      { headers: this.createHeaders(accessToken, 'bearer') },
      0,
      'user',
    );

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => 'Unable to read error');
      throw new Error(
        `User guilds fetch failed: ${response.status} - ${errorText}`,
      );
    }

    return response.json();
  }

  static async fetchBotGuilds(): Promise<DiscordGuild[]> {
    const response = await RetryManager.smartFetchWithRetry(
      ENDPOINTS.DISCORD_GUILDS,
      { headers: this.createHeaders(BOT_TOKEN, 'bot') },
      0,
      'bot',
    );

    if (!response.ok) {
      throw new Error(`Bot guilds fetch failed: ${response.status}`);
    }

    return response.json();
  }

  static async fetchGuildDetails(guildId: string): Promise<any> {
    const response = await RetryManager.smartFetchWithRetry(
      ENDPOINTS.DISCORD_GUILD_DETAIL(guildId),
      { headers: this.createHeaders(BOT_TOKEN, 'bot') },
      0,
      'bot',
    );

    if (!response.ok) {
      console.warn(
        `❌ Guild details failed for ${guildId}: ${response.status}`,
      );
      return null;
    }

    return response.json();
  }
}

// ==================== 主要函式實作 ====================

export async function getGuildDetails(
  guildId: string,
): Promise<ActiveServerInfo | null> {
  const cacheKey = `guild:details:${guildId}:v2`;

  // 檢查快取
  const cached = await getCache(cacheKey);
  if (cached && Utils.isValidActiveServerInfo(cached)) {
    return cached;
  }

  try {
    console.time(`⚡ guild-details-${guildId}`);

    const data = await HttpClient.fetchGuildDetails(guildId);
    if (!data) return null;

    const guildInfo: ActiveServerInfo = {
      id: data.id,
      name: data.name,
      icon: Utils.getDiscordImageUrl('icon', data.id, data.icon),
      banner: Utils.getDiscordImageUrl('banner', data.id, data.banner),
      owner: data.owner_id,
      memberCount: data.approximate_member_count ?? 0,
      OnlineMemberCount: data.approximate_presence_count ?? 0,
      admins: [],
      isInServer: true,
      isPublished: false,
    };

    // 異步快取
    CacheManager.batchSet(cacheKey, guildInfo, LIMITS.CACHE_TTL);

    console.timeEnd(`⚡ guild-details-${guildId}`);
    return guildInfo;
  } catch (error: unknown) {
    console.error(
      `💥 Error fetching guild details for ${guildId}:`,
      Utils.getErrorMessage(error),
    );
    return null;
  }
}

export async function getUserGuildsWithBotStatus(
  accessToken: string,
  userId: string,
): Promise<{
  activeServers: MinimalServerInfo[];
  inactiveServers: MinimalServerInfo[];
}> {
  console.time('🚀 getUserGuildsWithBotStatus');

  try {
    // 並行執行初始請求
    const [userCheck, userGuilds, botGuilds] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      }),
      HttpClient.fetchUserGuilds(accessToken),
      HttpClient.fetchBotGuilds(),
    ]);

    if (!userCheck) {
      console.warn(`⚠️ User ${userId} not found`);
      return { activeServers: [], inactiveServers: [] };
    }

    console.log(
      `📊 Processing ${userGuilds.length} user guilds, ${botGuilds.length} bot guilds`,
    );

    // 過濾和索引建立
    const manageableGuilds = userGuilds.filter(guild =>
      Utils.hasManageGuildPermission(guild.permissions),
    );
    const botGuildIdSet = new Set(botGuilds.map(guild => guild.id));
    const guildIds = manageableGuilds.map(guild => guild.id);

    // 並行獲取發布狀態
    const publishedGuildSet = await getPublishedServerMap(guildIds);

    // 處理結果
    const results = await processGuilds(
      manageableGuilds,
      botGuildIdSet,
      publishedGuildSet,
      userId,
    );

    console.timeEnd('🚀 getUserGuildsWithBotStatus');
    console.log(
      `✅ Processed: ${results.activeServers.length} active, ${results.inactiveServers.length} inactive servers`,
    );

    return results;
  } catch (error: unknown) {
    console.error(
      '💥 Critical error in getUserGuildsWithBotStatus:',
      Utils.getErrorMessage(error),
    );
    console.timeEnd('🚀 getUserGuildsWithBotStatus');
    throw error;
  }
}

// 私有輔助方法
async function processGuilds(
  guilds: DiscordGuild[],
  botGuildIdSet: Set<string>,
  publishedGuildSet: Set<string>,
  userId: string,
): Promise<{
  activeServers: MinimalServerInfo[];
  inactiveServers: MinimalServerInfo[];
}> {
  const activeServers: MinimalServerInfo[] = [];
  const inactiveServers: MinimalServerInfo[] = [];
  const serverAdminPairs: ServerAdminPair[] = [];

  console.time('⚡ guild-processing');

  await Promise.all(
    guilds.map(guild =>
      limit(async () => {
        try {
          const isInServer = botGuildIdSet.has(guild.id);
          const isPublished = publishedGuildSet.has(guild.id);

          const serverInfo: MinimalServerInfo = {
            id: guild.id,
            name: guild.name,
            icon: Utils.getDiscordImageUrl('icon', guild.id, guild.icon),
            banner: Utils.getDiscordImageUrl('banner', guild.id, guild.banner),
            memberCount: guild.approximate_member_count ?? 0,
            isInServer,
            isPublished,
          };

          if (isPublished) {
            serverAdminPairs.push({ serverId: guild.id, userId });
          }

          if (isInServer) {
            activeServers.push(serverInfo);
          } else {
            inactiveServers.push(serverInfo);
          }
        } catch (error) {
          console.error(`💥 Error processing guild ${guild.id}:`, error);
        }
      }),
    ),
  );

  console.timeEnd('⚡ guild-processing');

  // 異步處理管理員插入
  if (serverAdminPairs.length > 0) {
    bulkInsertServerAdmins(serverAdminPairs).catch((error: unknown) =>
      console.error(
        '💥 Background admin insert failed:',
        Utils.getErrorMessage(error),
      ),
    );
  }

  return {
    activeServers: Utils.sortByMemberCount(activeServers),
    inactiveServers: Utils.sortByMemberCount(inactiveServers),
  };
}

export async function getBatchGuildDetails(
  guildIds: string[],
): Promise<Map<string, ActiveServerInfo>> {
  if (guildIds.length === 0) return new Map();

  console.time(`⚡ batch-guild-details-${guildIds.length}`);

  const results = new Map<string, ActiveServerInfo>();
  const uniqueIds = [...new Set(guildIds)]; // 去重
  const cacheKeys = uniqueIds.map(id => `guild:details:${id}:v2`);

  // 批次檢查快取
  const cachedResults = await CacheManager.batchGet(cacheKeys);
  const uncachedIds = uniqueIds.filter(id => {
    const cacheKey = `guild:details:${id}:v2`;
    const cached = cachedResults.get(cacheKey);

    if (cached && Utils.isValidActiveServerInfo(cached)) {
      results.set(id, cached);
      return false;
    }
    return true;
  });

  console.log(
    `📋 Batch request: ${uniqueIds.length} total, ${results.size} cached, ${uncachedIds.length} to fetch`,
  );

  if (uncachedIds.length === 0) {
    console.timeEnd(`⚡ batch-guild-details-${guildIds.length}`);
    return results;
  }

  // 並行獲取未快取的資料
  await Promise.all(
    uncachedIds.map(guildId =>
      detailLimit(async () => {
        try {
          const details = await getGuildDetails(guildId);
          if (details) {
            results.set(guildId, details);
          }
        } catch (error: unknown) {
          console.error(
            `💥 Failed to get details for guild ${guildId}:`,
            Utils.getErrorMessage(error),
          );
        }
      }),
    ),
  );

  console.timeEnd(`⚡ batch-guild-details-${guildIds.length}`);
  return results;
}

// ==================== 導出 ====================
export { CacheManager, ConnectionPool, RetryManager as smartFetchWithRetry };

// 清理資源的函式
export function cleanup(): void {
  ConnectionPool.cleanup();
}
