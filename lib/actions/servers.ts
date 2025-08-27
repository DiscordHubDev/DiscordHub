'use server';

import {
  EditServerType,
  PublicServer,
  publicServerSelect,
  ServerType,
  ServerWithMinimalFavorited,
} from '@/lib/prisma_type';
import { prisma } from '@/lib/prisma';
import { MinimalServerInfo } from '../get-user-guild';

const CHUNK_SIZE = 500;

import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '../authOptions';
import { fetchDiscordServerInfo, verifyServerOwnership } from '../discord';
import { unstable_cache } from 'next/cache';
import { Prisma } from '@prisma/client';

const UpdateServerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(300).optional(),
  longDescription: z.string().max(5000).optional(),
  tags: z.array(z.string()).max(25).optional(),
  icon: z.string().url().nullable().optional(),
  banner: z.string().url().nullable().optional(),
  website: z.string().url().or(z.literal('')).nullable().optional(),
  inviteUrl: z.string().url().optional(),
  rules: z.array(z.any()).max(50).optional(),
  features: z.array(z.string()).max(50).optional(),
  screenshots: z.array(z.string().url()).max(5).optional(),
});

export async function updateServer(
  serverId: string,
  input: {
    name?: string;
    description?: string;
    longDescription?: string;
    tags?: string[];
    icon?: string;
    banner?: string;
    website?: string;
    inviteUrl?: string;
    rules?: any[];
    features?: string[];
    screenshots?: string[];
  },
) {
  const session = await getServerSession(authOptions);
  const userId = session?.discordProfile?.id;
  if (!userId) throw new Error('UNAUTHORIZED');

  // 驗證用戶是否有權限編輯這個伺服器
  const server = await prisma.server.findFirst({
    where: {
      id: serverId,
      OR: [{ ownerId: userId }, { admins: { some: { id: userId } } }],
    },
  });

  if (!server) {
    throw new Error('NOT_FOUND');
  }

  // 只更新允許的欄位，絕對不包含 owner、admins 等敏感欄位
  const updateData: any = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined)
    updateData.description = input.description;
  if (input.longDescription !== undefined)
    updateData.longDescription = input.longDescription;
  if (input.tags !== undefined) updateData.tags = input.tags;
  if (input.icon !== undefined) updateData.icon = input.icon;
  if (input.banner !== undefined) updateData.banner = input.banner;
  if (input.website !== undefined) updateData.website = input.website;
  if (input.inviteUrl !== undefined) updateData.inviteUrl = input.inviteUrl;
  if (input.rules !== undefined) updateData.rules = input.rules;
  if (input.features !== undefined) updateData.features = input.features;
  if (input.screenshots !== undefined)
    updateData.screenshots = { set: input.screenshots };

  const result = await prisma.server.update({
    where: { id: serverId },
    data: updateData,
  });

  return result;
}

export async function insertServer(
  data: {
    id: string;
    name: string;
    description?: string;
    longDescription?: string;
    inviteUrl?: string;
    website?: string;
    tags?: string[];
    rules?: any[];
    screenshots?: string[];
    icon?: string;
    banner?: string;
  },
  adminIds?: string[],
) {
  // 1. 驗證用戶身份
  const session = await getServerSession(authOptions);
  const userId = session?.discordProfile?.id;

  if (!userId) {
    throw new Error('UNAUTHORIZED');
  }

  try {
    // 2. 驗證伺服器是否已存在
    const existingServer = await prisma.server.findUnique({
      where: { id: data.id },
    });

    if (existingServer) {
      throw new Error('SERVER_ALREADY_EXISTS');
    }

    const admins = adminIds || [userId];

    // 3. 驗證用戶是否真的是這個Discord伺服器的擁有者
    const result = await verifyServerOwnership(data.id, userId);

    if (!result) {
      throw new Error('無法驗證伺服器擁有權（API 失敗或錯誤）');
      return;
    }

    const isAdmin = admins.includes(userId) || false;
    console.log(
      `User ${userId} is ${result.isOwner ? 'the owner' : 'an admin'} of server ${data.id}`,
    );

    if (!result && !isAdmin) {
      console.error(
        `User ${userId} is not the owner or admin of server ${data.id}`,
      );
      throw new Error('非擁有者和管理員，無法新增伺服器');
    }

    // 4. 獲取伺服器的實際資訊（從Discord API）
    const discordServerInfo = await fetchDiscordServerInfo(data.id);

    // 5. 先確保 User 存在（使用 upsert）
    await prisma.user.upsert({
      where: { id: userId },
      update: {}, // 如果存在就不更新
      create: {
        id: userId,
        username: session.discordProfile?.name || '未知使用者',
        avatar: session.discordProfile?.image_url || '',
      },
    });

    await prisma.$transaction(async tx => {
      const existing = await tx.user.findMany({
        where: { id: { in: admins } },
        select: { id: true },
      });
      const existingIds = new Set(existing.map(u => u.id));
      const missing = admins.filter(id => !existingIds.has(id));

      // 這裡你要能提供必填欄位（例如 username）
      // 下面用 id 當暫時 username；你可以改成真實名稱
      if (missing.length) {
        await tx.user.createMany({
          data: missing.map(id => ({ id, username: '未知使用者', avatar: '' })),
          skipDuplicates: true,
        });
      }

      const createdServer = await tx.server.create({
        data: {
          id: data.id,
          name: data.name,
          description: data.description || '',
          longDescription: data.longDescription,
          inviteUrl: data.inviteUrl,
          website: data.website,
          tags: data.tags || [],
          rules: data.rules || [],
          screenshots: data.screenshots || [],
          icon: data.icon || discordServerInfo.icon,
          banner: data.banner,

          // 關鍵：這些欄位由後端控制
          ownerId: result.owner_id, // 直接設定 ownerId
          members: discordServerInfo.memberCount || 0,
          online: discordServerInfo.onlineCount || 0,
          upvotes: 0,

          // 如果有管理員，使用 connect 連接已存在的用戶
          ...(admins.length > 0 && {
            admins: {
              connect: admins.map((id: string) => ({ id })),
            },
          }),
        },
      });

      return createdServer;
    });
  } catch (error) {
    console.error('❌ 新增伺服器失敗:', error);
    throw error;
  }
}

export const isOwnerexist = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? true : false;
};

export const AdminGetAllServers = async () => {
  try {
    const servers = await prisma.server.findMany({
      include: {
        owner: true,
        favoritedBy: true,
        admins: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return servers;
  } catch (error) {
    console.error('❌ 無法獲取伺服器列表:', error);
    throw error;
  }
};

export async function getAllServers(): Promise<PublicServer[]> {
  const servers = await prisma.server.findMany({
    orderBy: { createdAt: 'desc' },
    select: publicServerSelect,
  });
  console.log('Server count:', servers.length);
  return servers;
}

function buildQuery(category: string) {
  const where: Prisma.ServerWhereInput = {};
  const orderBy: Prisma.ServerOrderByWithRelationInput[] = [];

  switch (category) {
    case 'popular':
      // 置頂優先，其次人數
      orderBy.push({ pin: 'desc' }, { members: 'desc' });
      break;
    case 'new':
      // 最新建立（createdAt 越近越前）
      orderBy.push({ createdAt: 'desc' });
      break;
    case 'featured':
      // 先篩出一定規模，再依 upvotes / members
      where.members = { gte: 1000 };
      orderBy.push({ upvotes: 'desc' }, { members: 'desc' });
      break;
    case 'voted':
      orderBy.push({ upvotes: 'desc' });
      break;
    default:
      orderBy.push({ members: 'desc' });
      break;
  }

  return { where, orderBy };
}

export const getAllServersAction = unstable_cache(
  async (): Promise<PublicServer[]> => {
    const servers = await prisma.server.findMany({
      orderBy: { members: 'desc' },
      select: publicServerSelect,
    });

    return servers;
  },
  ['all-servers'],
  {
    revalidate: 120, // 2分鐘快取
    tags: ['servers'],
  },
);

export async function getServersByCategoryAction(
  category: string,
  page = 1,
  limit = 10,
) {
  const skip = (page - 1) * limit;

  return unstable_cache(
    async () => {
      const { where, orderBy } = buildQuery(category);

      const [servers, total] = await prisma.$transaction([
        prisma.server.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          select: publicServerSelect,
        }),
        prisma.server.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        servers,
        total,
        hasMore: skip + servers.length < total,
        currentPage: page,
        totalPages,
      };
    },
    // ✅ 這裡把參數寫進 key
    ['servers', `cat:${category}`, `p:${page}`, `l:${limit}`],
    { revalidate: 30, tags: ['servers'] },
  )(); // ← 立刻呼叫取得結果
}

// 清除快取的輔助函數（當有新伺服器加入時使用）
export async function revalidateServers() {
  'use server';

  const { revalidateTag } = await import('next/cache');
  revalidateTag('servers');
}

// 獲取單一伺服器
export const getServerWithFavoritedByGuildId = async (
  userId: string | undefined,
  guildId: string,
): Promise<ServerWithMinimalFavorited | null> => {
  const server = await prisma.server.findUnique({
    where: { id: guildId },
    include: {
      owner: true,
      favoritedBy: {
        where: { id: userId },
        select: { id: true },
      },
    },
  });

  return server;
};

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export async function getPublishedServerMap(
  ids: string[],
): Promise<Set<string>> {
  const chunks = chunk(ids, 100);
  const results = await Promise.all(
    chunks.map(chunk =>
      prisma.server.findMany({
        where: { id: { in: chunk } },
        select: { id: true },
      }),
    ),
  );

  return new Set(results.flat().map(s => s.id));
}

export async function getAllServerIdsChunked(): Promise<string[]> {
  const totalCount = await prisma.server.count();
  const pages = Math.ceil(totalCount / CHUNK_SIZE);

  const results = await Promise.all(
    Array.from({ length: pages }).map((_, i) =>
      prisma.server.findMany({
        skip: i * CHUNK_SIZE,
        take: CHUNK_SIZE,
        select: { id: true },
      }),
    ),
  );

  return results.flat().map(s => s.id);
}

export async function bulkInsertServerAdmins(
  pairs: { serverId: string; userId: string }[],
) {
  if (pairs.length === 0) return;

  const values = pairs
    .map(({ serverId, userId }) => `('${serverId}', '${userId}')`)
    .join(',');

  await prisma.$executeRawUnsafe(`
    INSERT INTO "_ServerAdmins" ("A", "B")
    VALUES ${values}
    ON CONFLICT DO NOTHING;
  `);
}

export const UserGetServerByGuildId = async (
  guildId: string,
): Promise<EditServerType | undefined> => {
  try {
    const server = await prisma.server.findFirst({
      where: { id: guildId },
      select: {
        id: true,
        name: true,
        description: true,
        longDescription: true,
        tags: true,
        members: true,
        online: true,
        upvotes: true,
        icon: true,
        banner: true,
        featured: true,
        createdAt: true,
        website: true,
        inviteUrl: true,
        VoteNotificationURL: true,
        secret: true,
        pin: true,
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true,
            banner: true,
            banner_color: true,
          },
        },
        admins: {
          select: {
            id: true,
            username: true,
          },
        },
        favoritedBy: {
          select: {
            id: true,
            username: true,
          },
        },
        screenshots: true,
        rules: true,
        features: true,
      },
    });

    if (!server) {
      return undefined;
    }

    return server;
  } catch (error) {
    console.error(`❌ 進入表單時無法獲取伺服器 (${guildId}):`, error);
    throw error;
  }
};

export const getServerByGuildId = async (
  guildId: string,
): Promise<ServerType | undefined> => {
  try {
    const server = await prisma.server.findFirst({
      where: { id: guildId },
      select: {
        id: true,
        name: true,
        description: true,
        longDescription: true, // 若不想公開就拿掉
        tags: true,
        members: true,
        online: true,
        upvotes: true,
        icon: true,
        banner: true,
        featured: true,
        createdAt: true,
        website: true,
        inviteUrl: true,
        pin: true,
        owner: {
          select: {
            username: true,
            avatar: true,
            banner: true,
            banner_color: true,
          },
        },
        admins: {
          select: {
            id: true,
            username: true,
          },
        },
        favoritedBy: {
          select: {
            id: true,
            username: true,
          },
        },
        screenshots: true,
        rules: true,
        features: true,
      },
    });

    if (!server) {
      return undefined;
    }

    return server;
  } catch (error) {
    console.error(`❌ 無法獲取伺服器 (${guildId}):`, error);
    throw error;
  }
};

export async function addServerAdmin(guild: MinimalServerInfo, userId: string) {
  try {
    const [server, user] = await Promise.all([
      prisma.server.findUnique({ where: { id: guild.id } }),
      prisma.user.findUnique({ where: { id: userId } }),
    ]);

    if (!server || !user) {
      return null;
    }

    const isAlreadyAdmin = await prisma.server.findFirst({
      where: {
        id: guild.id,
        admins: {
          some: { id: userId },
        },
      },
      select: { id: true },
    });

    if (isAlreadyAdmin) {
      return null;
    }

    return await prisma.server.update({
      where: { id: guild.id },
      data: {
        admins: {
          connect: { id: userId },
        },
      },
    });
  } catch (err) {
    console.error(
      `❌ 加入 admin 時發生錯誤 (guild: ${guild.id}, user: ${userId})`,
      err,
    );
    return null;
  }
}

export const deleteServerByGuildId = async (
  guildId: string,
): Promise<{ success: boolean; error?: any }> => {
  try {
    await prisma.server.delete({
      where: { id: guildId },
    });

    return { success: true };
  } catch (error) {
    console.error(`❌ 無法刪除伺服器 (${guildId}):`, error);
    return { success: false, error };
  }
};
