'use server';

import { prisma } from '@/lib/prisma';
import {
  BotFormData,
  DiscordBotRPCInfo,
  Screenshot,
  UserProfile,
} from '../types';
import { BotUpdateInput } from '../prisma_type';
import {
  extractPermissionsFromInviteUrl,
  fetchUserInfo,
  hasAdministratorPermission,
} from '../utils';

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

export async function getAllBots() {
  const bots = await prisma.bot.findMany({
    where: {
      status: 'approved',
    },
    include: {
      developers: true,
      commands: true,
    },
  });

  return bots;
}

export async function getBot(id: string) {
  const bot = await prisma.bot.findFirst({
    where: {
      id,
      status: 'approved',
    },
    include: {
      developers: true,
      commands: true,
      favoritedBy: true,
    },
  });
  return bot;
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
