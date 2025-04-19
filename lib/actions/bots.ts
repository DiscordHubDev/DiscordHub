'use server';

import { prisma } from '@/lib/prisma';
import { BotFormData, DiscordBotRPCInfo, Screenshot } from '../types';
import { BotUpdateInput } from '../prisma_type';
import { fetchUserInfo, hasAdministratorPermission } from '../utils';

export async function transformToBotUpdateData(
  formData: BotFormData,
  isAdmin: boolean,
  banner?: string | undefined,
): Promise<BotUpdateInput> {
  return {
    name: formData.botName,
    isAdmin,
    banner: banner ?? null,
    prefix: formData.botPrefix,
    description: formData.botDescription,
    longDescription: formData.botLongDescription ?? null,
    inviteUrl: formData.botInvite,
    website: formData.botWebsite || null,
    supportServer: formData.botSupport || null,
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

export async function updateBot(
  id: string,
  formData: BotFormData,
  screenshots: Screenshot[],
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
    rpcData.install_params.permissions,
  );

  const info = await fetchUserInfo(id);

  const botFields = {
    ...(await transformToBotUpdateData(formData, isAdmin, info.banner_url)),
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
