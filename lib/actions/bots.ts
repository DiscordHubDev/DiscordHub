'use server';

import { prisma } from '@/lib/prisma';
import {
  BotFormData,
  DiscordBotRPCInfo,
  Screenshot,
  UserProfile,
} from '../types';
import {
  BotType,
  BotUpdateInput,
  PublicBot,
  publicBotSelect,
} from '../prisma_type';
import {
  extractPermissionsFromInviteUrl,
  fetchUserInfo,
  hasAdministratorPermission,
} from '../utils';
import { unstable_cache } from 'next/cache';

export async function transformToBotUpdateData(
  formData: BotFormData,
  isAdmin: boolean,
  is_verified: boolean,
  info: UserProfile,
  banner?: string,
): Promise<BotUpdateInput> {
  return {
    name: info.username,
    isAdmin,
    banner: banner ?? info.banner_url ?? null,
    icon: info.avatar_url ?? null,
    prefix: formData.botPrefix,
    description: formData.botDescription,
    longDescription: formData.botLongDescription ?? null,
    inviteUrl: formData.botInvite,
    website: formData.botWebsite || null,
    supportServer: formData.botSupport || null,
    verified: is_verified,
    VoteNotificationURL: formData.webhook_url,
    secret: formData.secret,
    tags: {
      set: formData.tags,
    },
    developers: {
      set: formData.developers.map(dev => ({
        id: dev.name,
      })),
    },
  };
}

export async function getBotListChunked(): Promise<
  {
    id: string;
    name: string;
    servers: number;
    icon: string | null;
    banner: string | null;
  }[]
> {
  const CHUNK_SIZE = 500;
  const total = await prisma.bot.count({
    where: { status: 'approved' },
  });

  const pages = Math.ceil(total / CHUNK_SIZE);

  const results = await Promise.all(
    Array.from({ length: pages }).map((_, i) =>
      prisma.bot.findMany({
        where: { status: 'approved' },
        skip: i * CHUNK_SIZE,
        take: CHUNK_SIZE,
        select: {
          id: true,
          name: true,
          servers: true,
          icon: true,
          banner: true,
        },
        orderBy: {
          servers: 'desc',
        },
      }),
    ),
  );

  return results.flat();
}

export async function updateBot(
  id: string,
  formData: BotFormData,
  screenshots: Screenshot[],
  banner?: string,
) {
  const res = await fetch(
    `https://discord.com/api/v10/applications/${id.trim()}/rpc`,
    {
      headers: {
        'User-Agent': 'DiscordHubs/1.0',
      },
    },
  );

  const rpcData: DiscordBotRPCInfo = await res.json();

  const isAdmin = hasAdministratorPermission(
    rpcData.install_params
      ? rpcData.install_params.permissions
      : (extractPermissionsFromInviteUrl(formData.botInvite) ?? '0'),
  );

  const info = await fetchUserInfo(id);

  const botFields = {
    ...(await transformToBotUpdateData(
      formData,
      isAdmin,
      rpcData.is_verified,
      info,
      banner,
    )),
    screenshots: screenshots.map(s => s.url),
  };

  await prisma.$transaction([
    prisma.bot.update({
      where: { id },
      data: botFields,
    }),
    prisma.botCommand.deleteMany({
      where: { botId: id },
    }),
    prisma.botCommand.createMany({
      data: formData.commands.map(cmd => ({
        name: cmd.name,
        description: cmd.description,
        usage: cmd.usage,
        category: cmd.category || null,
        botId: id,
      })),
    }),
  ]);
}

export async function getUserVotesForBots(userId: string, botIds: string[]) {
  const votes = await prisma.vote.findMany({
    where: {
      userId: userId,
      itemId: {
        in: botIds,
      },
      itemType: 'bot',
    },
    select: {
      itemId: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return new Map(votes.map(vote => [vote.itemId, vote]));
}

export async function getAllBots(): Promise<PublicBot[]> {
  return prisma.bot.findMany({
    where: { status: 'approved' },
    orderBy: { createdAt: 'desc' }, // 或 upvotes: 'desc'
    select: publicBotSelect,
  });
}

export async function AdminGetAllBots(): Promise<BotType[]> {
  return prisma.bot.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      developers: true,
      commands: true,
      favoritedBy: true,
    },
  });
}

export async function getBot(id: string) {
  return await prisma.bot.findFirst({
    where: {
      id: id,
      status: 'approved',
    },
    include: {
      developers: {
        select: {
          id: true,
          username: true,
          avatar: true,
          banner: true,
          banner_color: true,
          bio: true,
          joinedAt: true,
          social: true,
        },
      },
      commands: {
        select: {
          id: true,
          name: true,
          description: true,
          usage: true,
          category: true,
        },
      },
      favoritedBy: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
    },
  });
}

export async function getBotForEdit(id: string) {
  const bot = await prisma.bot.findFirst({
    where: {
      id,
    },
    include: {
      developers: true,
      commands: true,
      favoritedBy: true,
    },
  });
  return bot;
}

export async function deleteBot(id: string) {
  try {
    const deleted = await prisma.bot.delete({
      where: { id },
    });

    return { success: true, bot: deleted };
  } catch (error) {
    console.error('❌ 刪除 Bot 失敗：', error);
    return { success: false, error };
  }
}

export async function getPendingBots() {
  const bots = await prisma.bot.findMany({
    where: {
      status: 'pending',
    },
    include: {
      developers: true,
      commands: true,
      favoritedBy: true,
    },
    orderBy: {
      upvotes: 'desc',
    },
  });

  return bots;
}

export async function updateBotServerCount(botId: string, serverCount: number) {
  try {
    const updatedBot = await prisma.bot.update({
      where: { id: botId },
      data: { servers: serverCount },
    });
    return updatedBot;
  } catch (error) {
    console.error(error);
  }
}

type BotQuery = {
  where: Record<string, any>;
  orderBy: Record<string, 'asc' | 'desc'>[];
};

function buildBotQuery(category: string): BotQuery {
  const where: Record<string, any> = {};
  const orderBy: Record<string, 'asc' | 'desc'>[] = [];

  switch (category) {
    case 'popular':
      orderBy.push({ pin: 'desc' }, { servers: 'desc' });
      break;
    case 'new':
      orderBy.push({ createdAt: 'desc' });
      break;
    case 'featured':
      where.servers = { gte: 1000 };
      orderBy.push({ upvotes: 'desc' }, { servers: 'desc' });
      break;
    case 'voted':
      orderBy.push({ upvotes: 'desc' });
      break;
    default:
      orderBy.push({ servers: 'desc' });
      break;
  }

  return { where, orderBy };
}

export const getAllBotsAction = unstable_cache(
  async (): Promise<PublicBot[]> => {
    return prisma.bot.findMany({
      orderBy: { servers: 'desc' },
      select: publicBotSelect,
    });
  },
  ['bots', 'all'],
  { revalidate: 30 },
);

// 依類別 + 分頁取得 Bot，快取 30 秒
export async function getBotsByCategoryAction(
  category: string,
  page = 1,
  limit = 10,
): Promise<{
  bots: PublicBot[];
  total: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}> {
  const key = ['bots', `cat:${category}`, `p:${page}`, `l:${limit}`];

  return unstable_cache(
    async () => {
      const skip = (page - 1) * limit;
      const { where, orderBy } = buildBotQuery(category);

      const [bots, total] = await prisma.$transaction([
        prisma.bot.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          select: publicBotSelect,
        }),
        prisma.bot.count({ where }),
      ]);

      return {
        bots,
        total,
        hasMore: skip + bots.length < total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      };
    },
    key,
    { revalidate: 120 }, // 2分鐘快取
  )();
}

// Bot 專用快取重驗證（如需要）
export async function botRevalidateServersCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('servers');
}
