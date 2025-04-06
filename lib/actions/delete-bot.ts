"use server";

import { prisma } from "@/lib/prisma";

export async function deleteBot(id: string) {
  await prisma.bot.delete({
    where: { id },
  });
}
