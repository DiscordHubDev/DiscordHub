'use server';

import { BotWithRelations, BotWithRelationsInput } from '@/lib/prisma_type';
import { getDevelopersByIds } from '../get-developers';
import { prisma } from '@/lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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

    return { success: true, bot: createdBot };
  } catch (error: any) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return { success: false, message: '機器人已經申請過了！' };
    }

    return { success: false, message: '發生未知錯誤，請稍後再試' };
  }
};

export async function submitBot(data: BotWithRelationsInput) {
  const developers = await getDevelopersByIds(
    data.developers.map(dev => dev.id),
  );

  return await insertBot({
    ...data,
    developers,
  });
}
