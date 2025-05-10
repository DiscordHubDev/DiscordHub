'use server';

import { getServerSession } from 'next-auth';
import { prisma } from '../prisma';
import { VoteType } from '@prisma/client';
import { authOptions } from '@/lib/authOptions';

export async function checkVoteCooldown(itemId: string, itemType: VoteType) {
  const session = await getServerSession(authOptions);
  const userId = session?.discordProfile?.id;

  if (!userId) return { cooldown: 0 };

  const lastVote = await prisma.vote.findFirst({
    where: {
      userId,
      itemId,
      itemType,
    },
    orderBy: { createdAt: 'desc' },
  });

  const now = Date.now();
  const cooldownMs = 12 * 60 * 60 * 1000;

  if (lastVote) {
    const timeDiff = now - new Date(lastVote.createdAt).getTime();
    if (timeDiff < cooldownMs) {
      const remaining = Math.ceil((cooldownMs - timeDiff) / 1000);
      return { cooldown: remaining };
    }
  }

  return { cooldown: 0 };
}
