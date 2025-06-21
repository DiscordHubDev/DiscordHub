'use server';

import { getServerSession } from 'next-auth';
import { prisma } from '../prisma';
import { VoteType } from '@prisma/client';
import { authOptions } from '@/lib/authOptions';

export async function checkPinCooldown(itemId: string, itemType: VoteType) {
  const session = await getServerSession(authOptions);
  const userId = session?.discordProfile?.id;

  if (!userId) return { cooldown: 0 };

  const updated =
    itemType === 'server'
      ? await prisma.server.findUnique({ where: { id: itemId } })
      : await prisma.bot.findUnique({ where: { id: itemId } });

  const now = Date.now();

  if (!updated?.pinExpiry) return { cooldown: 0 };

  const expiryTime = new Date(updated.pinExpiry).getTime();
  const remainingMs = expiryTime - now;

  if (remainingMs > 0) {
    return { cooldown: Math.ceil(remainingMs / 1000) }; // 剩餘秒數
  }

  return { cooldown: 0 };
}
