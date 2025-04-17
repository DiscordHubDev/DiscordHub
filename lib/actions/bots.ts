'use server';

import { prisma } from '@/lib/prisma';
import { BotFormData, Screenshot } from '../types';
import { BotUpdateInput } from '../prisma_type';

export async function transformToBotUpdateData(
  formData: BotFormData,
): Promise<BotUpdateInput> {
  return {
    name: formData.botName,
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
  const botFields = {
    ...(await transformToBotUpdateData(formData)),
    screenshots: screenshots.map(s => s.url),
  };

  console.log('🔧 Updating bot with:', botFields);

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
