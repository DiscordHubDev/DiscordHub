'use server';

import { DcHubsJWT } from '../jwt';
import { prisma } from '../prisma';

export async function SignJWT(
  userId: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const tokens = await DcHubsJWT.signTokenPair({ id: userId });
  await prisma.apiToken.upsert({
    where: { userId },
    update: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
    create: {
      userId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
  return tokens;
}
