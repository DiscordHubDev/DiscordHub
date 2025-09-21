'use server';

import { prisma } from '../prisma';

export async function rateBot(
  userId: string,
  botId: string,
  rating: number,
  comment: string = '',
) {
  return await prisma.review.upsert({
    where: {
      userId_botId: { userId, botId },
    },
    update: {
      rating,
    },
    create: {
      userId,
      botId,
      rating,
      comment,
      vote: 0,
    },
  });
}

export async function rateServer(
  userId: string,
  serverId: string,
  rating: number,
  comment: string = '',
) {
  return prisma.review.upsert({
    where: {
      userId_serverId: { userId, serverId },
    },
    update: {
      rating,
    },
    create: {
      userId,
      serverId,
      rating,
      comment,
      vote: 0,
    },
  });
}
