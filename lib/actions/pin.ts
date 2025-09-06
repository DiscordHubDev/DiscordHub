'use server';

import { prisma } from '@/lib/prisma';
import { VoteType } from '@/lib/prisma_type';
import { getUser } from '../get-user';

export async function Pin(itemId: string, itemType: string) {
  const user = await getUser();
  const userId = user?.id;

  const normalizedType = itemType.toLowerCase() as VoteType;

  if (!userId) {
    return { success: false, error: 'NOT_LOGGED_IN' };
  }

  try {
    // 直接操作數據庫，不需要 HTTP 調用
    const existing =
      normalizedType === 'server'
        ? await prisma.server.findUnique({ where: { id: itemId } })
        : await prisma.bot.findUnique({ where: { id: itemId } });

    if (!existing) {
      return { success: false, error: 'NOT_FOUND' };
    }

    // 檢查是否已經置頂
    const nowUTC = new Date();
    if (existing.pin && existing.pinExpiry && existing.pinExpiry > nowUTC) {
      const remaining = Math.ceil(
        (existing.pinExpiry.getTime() - nowUTC.getTime()) / 1000,
      );
      return { success: false, error: 'COOLDOWN', remaining };
    }

    // 設定 12 小時後的 UTC 時間作為過期時間
    const expiryUTC = new Date(Date.now() + 12 * 60 * 60 * 1000);

    const updated =
      normalizedType === 'server'
        ? await prisma.server.update({
            where: { id: itemId },
            data: {
              pin: true,
              pinExpiry: expiryUTC,
            },
          })
        : await prisma.bot.update({
            where: { id: itemId },
            data: {
              pin: true,
              pinExpiry: expiryUTC,
            },
          });

    const remaining = Math.ceil(
      (expiryUTC.getTime() - nowUTC.getTime()) / 1000,
    );

    return {
      success: true,
      remaining: remaining,
      pinned: false,
      pinExpiry: expiryUTC,
    };
  } catch (error) {
    console.error('Pin error:', error);
    return { success: false, error: 'SERVER_ERROR' };
  }
}
