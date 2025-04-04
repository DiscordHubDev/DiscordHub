"use server";

import prisma from "@/lib/prisma";

export async function getDevelopersByIds(ids: string[]) {
  return prisma.user.findMany({ where: { id: { in: ids } } });
}
