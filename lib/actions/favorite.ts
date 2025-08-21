'use server';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../authOptions';

export async function toggleFavorite({
  target,
  id,
}: {
  target: 'server' | 'bot';
  id: string;
}): Promise<boolean> {
  const session = await getServerSession(authOptions);
  const userId = session?.discordProfile?.id;

  if (!userId) throw new Error('未登入');

  const user = (await prisma.user.findUnique({
    where: { id: userId },
    include:
      target === 'server' ? { favoriteServers: true } : { favoriteBots: true },
  })) as Prisma.UserGetPayload<{
    include: {
      favoriteServers: true;
      favoriteBots: true;
    };
  }>;

  if (!user) throw new Error('使用者不存在');

  const isFavorited =
    target === 'server'
      ? user.favoriteServers.some(s => s.id === id)
      : user.favoriteBots.some(b => b.id === id);

  await prisma.user.update({
    where: { id: userId },
    data: {
      [target === 'server' ? 'favoriteServers' : 'favoriteBots']: {
        [isFavorited ? 'disconnect' : 'connect']: { id },
      },
    },
  });

  return !isFavorited;
}
