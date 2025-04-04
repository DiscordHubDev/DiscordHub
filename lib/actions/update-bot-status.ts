"use server";

import prisma from "@/lib/prisma";

export async function updateBotStatus(
  botId: string,
  status: "approved" | "rejected"
) {
  await prisma.bot.update({
    where: { id: botId },
    data: { status },
  });
}
