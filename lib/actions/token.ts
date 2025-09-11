// app/actions/apiKey.ts
'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { DcHubsJWT } from '../jwt';

function generateToken(userId: string) {
  return DcHubsJWT.signTokenPair({ id: userId });
}

export async function getApiToken(userId: string) {
  const token = await prisma.apiToken.findUnique({ where: { userId } });
  return token;
}

export async function createOrRegenerateApiKey() {
  const session = await getServerSession(authOptions);
  const userId = session?.discordProfile?.id;
  if (!userId) throw new Error('Unauthorized');

  const { accessToken, refreshToken } = await generateToken(userId);

  // 寫入 DB，只保留 hash 或完整存起來（依需求）
  await prisma.apiToken.upsert({
    where: { userId },
    update: { accessToken, refreshToken },
    create: { userId, accessToken, refreshToken },
  });

  return { accessToken, refreshToken };
}
