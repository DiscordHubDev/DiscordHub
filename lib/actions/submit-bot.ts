"use server";

import { BotWithRelations, BotWithRelationsInput } from "./get-pending-bot";
import { getDevelopersByIds } from "../get-developers";
import prisma from "../prisma";

const insertBot = async (data: BotWithRelations) => {
  const { commands, developers, ...bot } = data;

  try {
    const createdBot = await prisma.bot.create({
      data: {
        ...bot,
        approvedAt: new Date(),
        commands: {
          create: commands.map((cmd) => ({
            name: cmd.name,
            description: cmd.description,
            usage: cmd.usage,
            category: cmd.category ?? null,
          })),
        },
        developers: {
          connect: developers.map((dev) => ({ id: dev.id })),
        },
      },
      include: {
        commands: true,
        developers: true,
      },
    });

    console.log("✅ 新增機器人成功:", createdBot);
    return createdBot;
  } catch (error) {
    console.error("❌ 新增機器人失敗:", error);
    throw error;
  }
};

export async function submitBot(data: BotWithRelationsInput) {
  const developers = await getDevelopersByIds(
    data.developers.map((dev) => dev.id)
  );

  await insertBot({
    ...data,
    developers,
  });
}
