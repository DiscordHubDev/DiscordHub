'use server';

import { prisma } from '@/lib/prisma';
import { VoteType } from '@/lib/prisma_type';
import { getUser } from '../get-user';

export async function Vote(itemId: string, itemType: string) {
  const user = await getUser();
  const userId = user?.id;

  const normalizedType = itemType.toLowerCase() as VoteType;

  console.log('type', normalizedType);

  if (!userId) {
    return { success: false, error: 'NOT_LOGGED_IN' };
  }

  const lastVote = await prisma.vote.findFirst({
    where: {
      userId,
      itemId,
      itemType: normalizedType,
    },
    orderBy: { createdAt: 'desc' },
  });

  const now = Date.now();
  const cooldown = 12 * 60 * 60 * 1000; // 12 hr

  if (lastVote && now - new Date(lastVote.createdAt).getTime() < cooldown) {
    const remaining = cooldown - (now - new Date(lastVote.createdAt).getTime());
    return { success: false, error: 'COOLDOWN', remaining };
  }

  // 投票紀錄
  await prisma.vote.create({
    data: {
      userId,
      itemId,
      itemType: normalizedType,
    },
  });

  // 更新票數
  const updated =
    normalizedType === 'server'
      ? await prisma.server.update({
          where: { id: itemId },
          data: { upvotes: { increment: 1 } },
        })
      : await prisma.bot.update({
          where: { id: itemId },
          data: { upvotes: { increment: 1 } },
        });

  return { success: true, upvotes: updated.upvotes };
}
