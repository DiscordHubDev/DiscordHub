'use server';

import { BotWithRelations, BotWithRelationsInput } from '@/lib/prisma_type';
import { getDevelopersByIds } from '../get-developers';
import { prisma } from '@/lib/prisma';

const insertBot = async (data: BotWithRelations) => {
  const { commands, developers, ...bot } = data;

  try {
    const createdBot = await prisma.bot.create({
      data: {
        ...bot,
        approvedAt: new Date(),
        commands: {
          create: commands.map(cmd => ({
            name: cmd.name,
            description: cmd.description,
            usage: cmd.usage,
            category: cmd.category ?? null,
          })),
        },
        developers: {
          connect: developers.map(dev => ({ id: dev.id })),
        },
      },
      include: {
        commands: true,
        developers: true,
      },
    });

    return createdBot;
  } catch (error) {
    console.error('❌ 新增機器人失敗:', error);
    throw error;
  }
};

export async function submitBot(data: BotWithRelationsInput) {
  const developers = await getDevelopersByIds(
    data.developers.map(dev => dev.id),
  );

  await insertBot({
    ...data,
    developers,
  });
}
