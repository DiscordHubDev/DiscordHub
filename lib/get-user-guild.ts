import pLimit from 'p-limit';
import { getCache, setCache } from './cache';
import {
  bulkInsertServerAdmins,
  getPublishedServerMap,
} from './actions/servers';
import { prisma } from './prisma';
import { Agent, AgentOptions } from 'https';

// ==================== 常數定義 ====================
const LIMITS = {
  CONCURRENT_REQUESTS: 80, // 增加並發數
  DETAILED_REQUESTS: 40, // 增加詳細請求並發數
  MAX_RETRIES: 2, // 減少重試次數
  BASE_DELAY: 50, // 減少基礎延遲
  TIMEOUT: 5000, // 減少超時時間
  BATCH_DELAY: 5, // 減少批次延遲
  CACHE_TTL: 60, // 增加快取時間到30分鐘
  IMAGE_SIZE: 512,
  PREFETCH_THRESHOLD: 10, // 預取閾值
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

const ENDPOINTS_EXTENDED = {
  ...ENDPOINTS,
  DISCORD_GUILD_MEMBERS: (
    guildId: string,
    limit: number = 1000,
    after?: string,
  ) =>
    `https://discord.com/api/guilds/${guildId}/members?limit=${limit}${
      after ? `&after=${after}` : ''
    }`,
  DISCORD_GUILD_ROLES: (guildId: string) =>
    `https://discord.com/api/guilds/${guildId}/roles`,
} as const;

const PERMISSIONS = {
  MANAGE_GUILD: BigInt(0x20), // 管理伺服器
  ADMINISTRATOR: BigInt(0x8), // 管理員
} as const;

class DiscordPermissions {
  // 檢查是否有管理員權限（最高權限，擁有所有權限）
  public static hasAdministratorPermission(permissions: bigint): boolean {
    return (permissions & PERMISSIONS.ADMINISTRATOR) !== BigInt(0);
  }

  // 檢查是否有管理公會權限
  public static hasManageGuildPermission(permissions: bigint): boolean {
    return (BigInt(permissions) & PERMISSIONS.MANAGE_GUILD) !== BigInt(0);
  }

  // 檢查是否有管理權限（管理員 OR 管理公會）
  public static hasManagementPermission(permissions: bigint): boolean {
    return (
      this.hasAdministratorPermission(permissions) ||
      this.hasManageGuildPermission(permissions)
    );
  }

  // 如果你想要更嚴格，只允許管理員
  public static hasStrictAdminPermission(permissions: bigint): boolean {
    return this.hasAdministratorPermission(permissions);
  }
}

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
type DiscordMember = {
  user: {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
  };
  nick: string | null;
  roles: string[];
  joined_at: string;
  premium_since: string | null;
  permissions?: string;
};

type DiscordRole = {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
};

type GuildAdminInfo = {
  userId: string;
  username: string;
  nickname: string | null;
  hasDirectPermission: boolean;
  hasRolePermission: boolean;
  roles: string[];
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

// ==================== 智能預取管理器 ====================
class PrefetchManager {
  private static readonly activeRequests = new Map<string, Promise<any>>();
  private static readonly prefetchQueue = new Set<string>();

  static async smartPrefetch(guildIds: string[]): Promise<void> {
    const unprefetched = guildIds.filter(id => {
      const cacheKey = `guild:details:${id}:v2`;
      return !this.activeRequests.has(cacheKey) && !this.prefetchQueue.has(id);
    });

    if (unprefetched.length === 0) return;

    // 異步預取，不阻塞主流程
    setTimeout(() => {
      this.executePrefetch(unprefetched.slice(0, LIMITS.PREFETCH_THRESHOLD));
    }, 0);
  }

  private static async executePrefetch(guildIds: string[]): Promise<void> {
    const promises = guildIds.map(async guildId => {
      this.prefetchQueue.add(guildId);
      try {
        await getGuildDetailsWithAdmins(guildId);
      } catch (error) {
        console.warn(`Prefetch failed for ${guildId}:`, error);
      } finally {
        this.prefetchQueue.delete(guildId);
      }
    });

    await Promise.allSettled(promises);
  }

  static getActiveRequest(key: string): Promise<any> | null {
    return this.activeRequests.get(key) || null;
  }

  static setActiveRequest(key: string, promise: Promise<any>): void {
    this.activeRequests.set(key, promise);
    promise.finally(() => this.activeRequests.delete(key));
  }
}

// ==================== 批次快取管理器優化 ====================
class CacheManager {
  private static readonly pendingGets = new Map<string, Promise<any>>();
  private static readonly pendingSets = new Map<string, CacheEntry>();
  private static batchTimeout: NodeJS.Timeout | null = null;
  private static readonly maxBatchSize = 100; // 限制批次大小

  static async batchGet(keys: string[]): Promise<Map<string, any>> {
    if (keys.length === 0) return new Map();

    const results = new Map<string, any>();
    const uniqueKeys = [...new Set(keys)];

    // 分批處理大量請求
    const batches = this.createBatches(uniqueKeys, this.maxBatchSize);

    await Promise.all(batches.map(batch => this.processBatch(batch, results)));

    return results;
  }

  private static createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private static async processBatch(
    keys: string[],
    results: Map<string, any>,
  ): Promise<void> {
    const promises = keys.map(async key => {
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
    if (this.batchTimeout) return; // 避免重複調度

    this.batchTimeout = setTimeout(() => {
      this.flushSets();
    }, LIMITS.BATCH_DELAY);
  }

  private static async flushSets(): Promise<void> {
    const entries = Array.from(this.pendingSets.entries());
    this.pendingSets.clear();
    this.batchTimeout = null;

    if (entries.length === 0) return;

    // 分批處理大量寫入
    const batches = this.createBatches(entries, 50);

    await Promise.all(batches.map(batch => this.flushBatch(batch)));
  }

  private static async flushBatch(
    entries: Array<[string, CacheEntry]>,
  ): Promise<void> {
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
  private static readonly config: AgentOptions = {
    keepAlive: true,
    maxSockets: 100,
    keepAliveMsecs: 500,
    maxFreeSockets: 20,
    scheduling: 'fifo', // OK：型別正確
    // 注意：AgentOptions 裡通常沒有 timeout，見下方說明
  };

  private static readonly agents = {
    user: new Agent(this.config),
    bot: new Agent(this.config),
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

    const networkErrorNames = [
      'AbortError',
      'TypeError',
      'TimeoutError',
      'ECONNRESET',
      'ETIMEDOUT',
    ];
    return (
      networkErrorNames.includes(error.name) ||
      error.message.includes('fetch') ||
      error.message.includes('timeout') ||
      error.message.includes('network')
    );
  }

  static hasManageGuildPermission(
    permissions: string | number | bigint,
  ): boolean {
    const perms = BigInt(permissions);
    return DiscordPermissions.hasManageGuildPermission(perms);
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

  // 新增：快速過濾和映射
  static fastFilter<T>(items: T[], predicate: (item: T) => boolean): T[] {
    const result: T[] = [];
    for (let i = 0; i < items.length; i++) {
      if (predicate(items[i])) {
        result.push(items[i]);
      }
    }
    return result;
  }
}

// ==================== 智慧重試機制優化 ====================
class RetryManager {
  private static readonly circuitBreaker = new Map<
    string,
    {
      failures: number;
      lastFailure: number;
      isOpen: boolean;
    }
  >();

  static async smartFetchWithRetry(
    url: string,
    options: RequestInit,
    retryCount = 0,
    type: 'user' | 'bot' = 'bot',
  ): Promise<Response> {
    // 檢查熔斷器
    if (this.isCircuitOpen(url)) {
      throw new Error(`Circuit breaker open for ${url}`);
    }

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

      // 成功則重置熔斷器
      this.resetCircuitBreaker(url);

      return await this.handleResponse(
        response,
        url,
        options,
        retryCount,
        type,
      );
    } catch (error) {
      this.recordFailure(url);
      return await this.handleError(error, url, options, retryCount, type);
    }
  }

  private static isCircuitOpen(url: string): boolean {
    const state = this.circuitBreaker.get(url);
    if (!state) return false;

    const now = Date.now();
    // 30秒後重試
    if (state.isOpen && now - state.lastFailure > 30000) {
      state.isOpen = false;
      state.failures = 0;
    }

    return state.isOpen;
  }

  private static recordFailure(url: string): void {
    const state = this.circuitBreaker.get(url) || {
      failures: 0,
      lastFailure: 0,
      isOpen: false,
    };
    state.failures++;
    state.lastFailure = Date.now();

    // 連續失敗5次則開啟熔斷器
    if (state.failures >= 5) {
      state.isOpen = true;
    }

    this.circuitBreaker.set(url, state);
  }

  private static resetCircuitBreaker(url: string): void {
    this.circuitBreaker.delete(url);
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
      ? Math.min(parseInt(retryAfter) * 1000, 5000) // 最大等待5秒
      : this.calculateDelay(retryCount);

    console.log(
      `🔄 Rate limited. Retry ${retryCount + 1}/${
        LIMITS.MAX_RETRIES
      } after ${delay}ms`,
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
      `🔄 ${reason}. Retry ${retryCount + 1}/${
        LIMITS.MAX_RETRIES
      } after ${delay}ms`,
    );
    await Utils.delay(delay);
    return this.smartFetchWithRetry(url, options, retryCount + 1, type);
  }

  private static calculateDelay(retryCount: number): number {
    // 使用 jitter 避免驚群效應
    const baseDelay = LIMITS.BASE_DELAY * Math.pow(1.5, retryCount);
    const jitter = Math.random() * 0.3 * baseDelay;
    return Math.min(baseDelay + jitter, 2000); // 最大延遲2秒
  }
}

// ==================== HTTP 請求工具 ====================
class HttpClient {
  private static readonly requestCache = new Map<string, Promise<any>>();

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
    const cacheKey = `user_guilds:${accessToken.slice(-10)}`;

    if (this.requestCache.has(cacheKey)) {
      return this.requestCache.get(cacheKey);
    }

    const promise = this.performUserGuildsFetch(accessToken);
    this.requestCache.set(cacheKey, promise);

    // 清理快取
    setTimeout(() => this.requestCache.delete(cacheKey), 30000);

    return promise;
  }

  private static async performUserGuildsFetch(
    accessToken: string,
  ): Promise<DiscordGuild[]> {
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
    const cacheKey = 'bot_guilds';

    if (this.requestCache.has(cacheKey)) {
      return this.requestCache.get(cacheKey);
    }

    const promise = this.performBotGuildsFetch();
    this.requestCache.set(cacheKey, promise);

    // 清理快取
    setTimeout(() => this.requestCache.delete(cacheKey), 60000);

    return promise;
  }

  private static async performBotGuildsFetch(): Promise<DiscordGuild[]> {
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

class GuildAdminManager {
  private static readonly adminCache = new Map<
    string,
    {
      admins: string[];
      timestamp: number;
    }
  >();
  private static readonly ADMIN_CACHE_TTL = 60000; // 5分鐘快取

  /**
   * 獲取群組中所有具有 ManageGuild 權限的用戶 ID
   */
  static async getGuildAdmins(guildId: string): Promise<string[]> {
    const cacheKey = `guild_admins:${guildId}`;

    // // 檢查快取
    // const cached = this.adminCache.get(cacheKey);
    // if (cached && Date.now() - cached.timestamp < this.ADMIN_CACHE_TTL) {
    //   return cached.admins;
    // }

    try {
      const adminIds = await this.fetchGuildAdmins(guildId);

      // 更新快取
      this.adminCache.set(cacheKey, {
        admins: adminIds,
        timestamp: Date.now(),
      });

      return adminIds;
    } catch (error) {
      console.error(
        `💥 Failed to get admins for guild ${guildId}:`,
        Utils.getErrorMessage(error),
      );
      return [];
    }
  }

  /**
   * 獲取群組詳細管理員信息（包含用戶名等）
   */
  static async getGuildAdminDetails(
    guildId: string,
  ): Promise<GuildAdminInfo[]> {
    try {
      const [members, roles] = await Promise.all([
        this.fetchGuildMembers(guildId),
        this.fetchGuildRoles(guildId),
      ]);

      const rolePermissions = new Map<string, bigint>();
      roles.forEach(role => {
        rolePermissions.set(role.id, BigInt(role.permissions));
      });

      const adminDetails: GuildAdminInfo[] = [];

      for (const member of members) {
        const { hasDirectPermission, hasRolePermission } =
          this.checkMemberPermissions(member, rolePermissions);

        if (hasDirectPermission || hasRolePermission) {
          adminDetails.push({
            userId: member.user.id,
            username: member.user.username,
            nickname: member.nick,
            hasDirectPermission,
            hasRolePermission,
            roles: member.roles,
          });
        }
      }

      return adminDetails;
    } catch (error) {
      console.error(
        `💥 Failed to get admin details for guild ${guildId}:`,
        Utils.getErrorMessage(error),
      );
      return [];
    }
  }

  private static async fetchGuildAdmins(guildId: string): Promise<string[]> {
    const members = await this.fetchGuildMembers(guildId);
    const roles = await this.fetchGuildRoles(guildId);

    // 建立角色權限映射
    const rolePermissions = new Map<string, bigint>();
    roles.forEach(role => {
      rolePermissions.set(role.id, BigInt(role.permissions));
    });

    const adminIds: string[] = [];

    for (const member of members) {
      const { hasDirectPermission, hasRolePermission } =
        this.checkMemberPermissions(member, rolePermissions);

      if (hasDirectPermission || hasRolePermission) {
        adminIds.push(member.user.id);
      }
    }

    return adminIds;
  }

  private static checkMemberPermissions(
    member: DiscordMember,
    rolePermissions: Map<string, bigint>,
  ): { hasDirectPermission: boolean; hasRolePermission: boolean } {
    // 檢查直接權限
    const hasDirectPermission = member.permissions
      ? this.hasManageGuildPermission(BigInt(member.permissions))
      : false;

    // 檢查角色權限
    let hasRolePermission = false;
    for (const roleId of member.roles) {
      const rolePerms = rolePermissions.get(roleId);
      if (rolePerms && this.hasManageGuildPermission(rolePerms)) {
        hasRolePermission = true;
        break;
      }
    }

    return { hasDirectPermission, hasRolePermission };
  }

  private static hasManageGuildPermission(permissions: bigint): boolean {
    return DiscordPermissions.hasManagementPermission(permissions);
  }

  private static async fetchGuildMembers(
    guildId: string,
  ): Promise<DiscordMember[]> {
    const allMembers: DiscordMember[] = [];
    let after: string | undefined;
    const limit = 1000; // Discord API 最大限制

    do {
      const url = ENDPOINTS_EXTENDED.DISCORD_GUILD_MEMBERS(
        guildId,
        limit,
        after,
      );
      const response = await RetryManager.smartFetchWithRetry(
        url,
        { headers: HttpClient.createHeaders(BOT_TOKEN, 'bot') },
        0,
        'bot',
      );

      if (!response.ok) {
        if (response.status === 403) {
          console.warn(
            `⚠️ Insufficient permissions to fetch members for guild ${guildId}`,
          );
          break;
        }
        throw new Error(`Failed to fetch guild members: ${response.status}`);
      }

      const members: DiscordMember[] = await response.json();

      if (members.length === 0) break;

      allMembers.push(...members);
      after = members[members.length - 1].user.id;
    } while (after && allMembers.length < 50000); // 安全限制

    console.log(`📋 Fetched ${allMembers.length} members for guild ${guildId}`);
    return allMembers;
  }

  private static async fetchGuildRoles(
    guildId: string,
  ): Promise<DiscordRole[]> {
    const response = await RetryManager.smartFetchWithRetry(
      ENDPOINTS_EXTENDED.DISCORD_GUILD_ROLES(guildId),
      { headers: HttpClient.createHeaders(BOT_TOKEN, 'bot') },
      0,
      'bot',
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch guild roles: ${response.status}`);
    }

    return response.json();
  }

  /**
   * 清理過期的快取
   */
  static cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.adminCache.entries()) {
      if (now - value.timestamp > this.ADMIN_CACHE_TTL) {
        this.adminCache.delete(key);
      }
    }
  }
}

// ==================== 主要函式實作 ====================

export async function getGuildDetailsWithAdmins(
  guildId: string,
): Promise<ActiveServerInfo | null> {
  const cacheKey = `guild:details:${guildId}:v3`; // 更新版本號

  // 檢查是否有正在進行的請求
  const activeRequest = PrefetchManager.getActiveRequest(cacheKey);
  if (activeRequest) {
    try {
      return await activeRequest;
    } catch (error) {
      console.warn(`Active request failed for ${guildId}:`, error);
    }
  }

  // 檢查快取
  const cached = await getCache(cacheKey);
  if (cached && Utils.isValidActiveServerInfo(cached)) {
    return cached;
  }

  const promise = (async () => {
    try {
      // 並行獲取基本資訊和管理員列表
      const [guildData] = await Promise.all([
        HttpClient.fetchGuildDetails(guildId),
      ]);

      if (!guildData) return null;

      const admins = await GuildAdminManager.getGuildAdmins(guildId);

      console.log(`🔍 Fetched ${admins} for guild ${guildId}`);

      const guildInfo: ActiveServerInfo = {
        id: guildData.id,
        name: guildData.name,
        icon: Utils.getDiscordImageUrl('icon', guildData.id, guildData.icon),
        banner: Utils.getDiscordImageUrl(
          'banner',
          guildData.id,
          guildData.banner,
        ),
        owner: guildData.owner_id,
        memberCount: guildData.approximate_member_count ?? 0,
        OnlineMemberCount: guildData.approximate_presence_count ?? 0,
        admins: admins,
        isInServer: true,
        isPublished: false,
      };

      // 異步快取
      CacheManager.batchSet(cacheKey, guildInfo, LIMITS.CACHE_TTL);
      return guildInfo;
    } catch (error: unknown) {
      console.error(
        `💥 Error fetching guild details with admins for ${guildId}:`,
        Utils.getErrorMessage(error),
      );
      return null;
    }
  })();

  PrefetchManager.setActiveRequest(cacheKey, promise);
  return promise;
}

export async function getUserGuildsWithBotStatus(
  accessToken: string,
  userId: string,
): Promise<{
  activeServers: MinimalServerInfo[];
  inactiveServers: MinimalServerInfo[];
}> {
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

    // 使用快速過濾優化
    const manageableGuilds = Utils.fastFilter(userGuilds, guild =>
      Utils.hasManageGuildPermission(guild.permissions),
    );

    const botGuildIdSet = new Set(botGuilds.map(guild => guild.id));
    const guildIds = manageableGuilds.map(guild => guild.id);

    // 並行獲取發布狀態
    const publishedGuildSet = await getPublishedServerMap(guildIds);

    // 啟動智能預取
    const activeGuildIds = guildIds.filter(id => botGuildIdSet.has(id));
    if (activeGuildIds.length > 0) {
      PrefetchManager.smartPrefetch(activeGuildIds);
    }

    // 處理結果
    const results = await processGuilds(
      manageableGuilds,
      botGuildIdSet,
      publishedGuildSet,
      userId,
    );

    console.log(
      `✅ Processed: ${results.activeServers.length} active, ${results.inactiveServers.length} inactive servers`,
    );

    return results;
  } catch (error: unknown) {
    console.error(
      '💥 Critical error in getUserGuildsWithBotStatus:',
      Utils.getErrorMessage(error),
    );
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

  // 預先分配數組容量以提高性能
  activeServers.length = 0;
  inactiveServers.length = 0;

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

  // 異步處理管理員插入
  if (serverAdminPairs.length > 0) {
    // 不等待，完全異步處理
    setImmediate(() => {
      bulkInsertServerAdmins(serverAdminPairs).catch((error: unknown) =>
        console.error(
          '💥 Background admin insert failed:',
          Utils.getErrorMessage(error),
        ),
      );
    });
  }

  return {
    activeServers: Utils.sortByMemberCount(activeServers),
    inactiveServers: Utils.sortByMemberCount(inactiveServers),
  };
}

export async function getBatchGuildAdmins(
  guildIds: string[],
): Promise<Map<string, string[]>> {
  const results = new Map<string, string[]>();

  await Promise.all(
    guildIds.map(guildId =>
      limit(async () => {
        try {
          const admins = await GuildAdminManager.getGuildAdmins(guildId);
          results.set(guildId, admins);
        } catch (error) {
          console.error(`Failed to get admins for guild ${guildId}:`, error);
          results.set(guildId, []);
        }
      }),
    ),
  );

  return results;
}

export async function isUserGuildAdmin(
  guildId: string,
  userId: string,
): Promise<boolean> {
  try {
    const admins = await GuildAdminManager.getGuildAdmins(guildId);
    return admins.includes(userId);
  } catch (error) {
    console.error(
      `Failed to check admin status for user ${userId} in guild ${guildId}:`,
      error,
    );
    return false;
  }
}

export async function getBatchGuildDetailsWithAdmins(
  guildIds: string[],
): Promise<Map<string, ActiveServerInfo>> {
  if (guildIds.length === 0) return new Map();

  const results = new Map<string, ActiveServerInfo>();
  const uniqueIds = [...new Set(guildIds)];
  const cacheKeys = uniqueIds.map(id => `guild:details:${id}:v3`);

  // 批次檢查快取
  const cachedResults = await CacheManager.batchGet(cacheKeys);
  const uncachedIds = uniqueIds.filter(id => {
    const cacheKey = `guild:details:${id}:v3`;
    const cached = cachedResults.get(cacheKey);

    if (cached && Utils.isValidActiveServerInfo(cached)) {
      results.set(id, cached);
      return false;
    }
    return true;
  });

  console.log(
    `📋 Batch request with admins: ${uniqueIds.length} total, ${results.size} cached, ${uncachedIds.length} to fetch`,
  );

  if (uncachedIds.length === 0) {
    return results;
  }

  // 並行獲取未快取的資料
  await Promise.all(
    uncachedIds.map(guildId =>
      detailLimit(async () => {
        try {
          const details = await getGuildDetailsWithAdmins(guildId);
          if (details) {
            results.set(guildId, details);
          }
        } catch (error: unknown) {
          console.error(
            `💥 Failed to get details with admins for guild ${guildId}:`,
            Utils.getErrorMessage(error),
          );
        }
      }),
    ),
  );

  return results;
}

// ==================== 導出 ====================
export {
  CacheManager,
  ConnectionPool,
  RetryManager as smartFetchWithRetry,
  PrefetchManager,
};

// 清理資源的函式
export function cleanup(): void {
  ConnectionPool.cleanup();
}
