'use server';

import { prisma } from '@/lib/prisma';
import { VoteType } from '@/lib/prisma_type';
import { getUser } from '../get-user';
import crypto from 'crypto';

// 安全驗證配置
const SECURITY_CONFIG = {
  TOKEN_EXPIRY_MINUTES: 5,
  SECRET_KEY: process.env.NEXTAUTH_SECRET || 'default-secret', // 使用環境變數
  MAX_PIN_DURATION_HOURS: 12,
};

// 驗證安全令牌
function verifySecurityToken(
  token: string,
  itemId: string,
  itemType: string,
  userId: string,
): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [tokenId, tokenType, tokenUserId, tokenTimestamp] =
      decoded.split('-');

    // 基本匹配驗證
    if (
      tokenId !== itemId ||
      tokenType !== itemType.toLowerCase() ||
      tokenUserId !== userId
    ) {
      return false;
    }

    // 時間戳驗證（5分鐘內有效）
    const currentTimestamp = Math.floor(
      Date.now() / (1000 * 60 * SECURITY_CONFIG.TOKEN_EXPIRY_MINUTES),
    );
    const providedTimestamp = parseInt(tokenTimestamp);

    return Math.abs(currentTimestamp - providedTimestamp) <= 1; // 允許1個時間窗口的誤差
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

// 驗證項目 ID 格式
function validateItemId(itemId: string): boolean {
  // Discord ID 格式：17-19位數字
  return /^\d{17,19}$/.test(itemId);
}

// 生成操作日誌的哈希值（用於檢測重複操作）
function generateOperationHash(
  userId: string,
  itemId: string,
  itemType: string,
): string {
  const data = `${userId}-${itemId}-${itemType}-${Math.floor(
    Date.now() / (1000 * 60),
  )}`;
  return crypto
    .createHash('sha256')
    .update(data + SECURITY_CONFIG.SECRET_KEY)
    .digest('hex');
}

export async function Pin(
  itemId: string,
  itemType: string,
  securityData?: {
    securityToken?: string;
    itemName?: string;
    operationHash?: string;
    timestamp?: number;
  },
) {
  const user = await getUser();
  const userId = user?.id;

  const normalizedType = itemType.toLowerCase() as VoteType;

  // 基本驗證
  if (!userId) {
    return { success: false, error: 'NOT_LOGGED_IN' };
  }

  // 安全驗證
  if (!validateItemId(itemId)) {
    console.warn(`Invalid item ID format: ${itemId} from user: ${userId}`);
    return { success: false, error: 'INVALID_ID_FORMAT' };
  }

  // 驗證項目類型
  if (!['server', 'bot'].includes(normalizedType)) {
    console.warn(`Invalid item type: ${itemType} from user: ${userId}`);
    return { success: false, error: 'INVALID_TYPE' };
  }

  // 安全令牌驗證（如果提供）
  if (securityData?.securityToken) {
    if (
      !verifySecurityToken(securityData.securityToken, itemId, itemType, userId)
    ) {
      console.warn(
        `Security token verification failed for user: ${userId}, item: ${itemId}`,
      );
      return { success: false, error: 'SECURITY_VIOLATION' };
    }
  }

  // 防止過於頻繁的操作（時間戳檢查）
  if (securityData?.timestamp) {
    const timeDiff = Math.abs(Date.now() - securityData.timestamp);
    if (timeDiff > 30000) {
      // 30秒內的請求才有效
      console.warn(`Timestamp too old: ${timeDiff}ms from user: ${userId}`);
      return { success: false, error: 'REQUEST_EXPIRED' };
    }
  }

  try {
    // 查詢項目並驗證擁有權
    const existing =
      normalizedType === 'server'
        ? await prisma.server.findUnique({
            where: { id: itemId },
            select: {
              id: true,
              name: true,
              ownerId: true,
              pin: true,
              pinExpiry: true,
            },
          })
        : ((await prisma.bot.findUnique({
            where: { id: itemId },
            select: {
              id: true,
              name: true,
              developers: true,
              pin: true,
              pinExpiry: true,
            },
          })) as any);

    if (!existing) {
      console.warn(`Item not found: ${itemId} of type: ${normalizedType}`);
      return { success: false, error: 'NOT_FOUND' };
    }

    if (normalizedType === 'server') {
      if (existing.ownerId !== userId) {
        console.warn(
          `Unauthorized pin attempt: User ${userId} tried to pin item ${itemId} owned by ${existing.ownerId}`,
        );
        return { success: false, error: 'NOT_OWNER' };
      }
    } else {
      const developerIds = existing.developers
        ? existing.developers.map((d: { id: string }) => d.id)
        : [];
      if (!developerIds.includes(userId)) {
        console.warn(
          `Unauthorized pin attempt: User ${userId} tried to pin bot ${itemId} without being a developer`,
        );
        return { success: false, error: 'NOT_OWNER' };
      }
    }

    // 驗證項目名稱（如果提供，防止ID被替換）
    if (securityData?.itemName && existing.name !== securityData.itemName) {
      console.warn(
        `Item name mismatch for ${itemId}: expected ${securityData.itemName}, got ${existing.name}`,
      );
      return { success: false, error: 'ITEM_NAME_MISMATCH' };
    }

    // 檢查是否已經在置頂冷卻期內
    const nowUTC = new Date();
    if (existing.pin && existing.pinExpiry && existing.pinExpiry > nowUTC) {
      const remaining = Math.ceil(
        (existing.pinExpiry.getTime() - nowUTC.getTime()) / 1000,
      );
      return { success: false, error: 'COOLDOWN', remaining };
    }

    // 生成操作哈希值用於日誌記錄
    const operationHash = generateOperationHash(userId, itemId, normalizedType);

    // 設定置頂過期時間
    const expiryUTC = new Date(
      Date.now() + SECURITY_CONFIG.MAX_PIN_DURATION_HOURS * 60 * 60 * 1000,
    );

    // 執行置頂操作
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

    // 記錄操作日誌（可選，用於審計）
    console.log(
      `Pin successful: User ${userId} pinned ${normalizedType} ${itemId} (${
        existing.name
      }) until ${expiryUTC.toISOString()}, hash: ${operationHash}`,
    );

    const remaining = Math.ceil(
      (expiryUTC.getTime() - nowUTC.getTime()) / 1000,
    );

    return {
      success: true,
      remaining: remaining,
      pinned: true,
      pinExpiry: expiryUTC,
      operationHash, // 返回操作哈希值供前端使用
    };
  } catch (error) {
    console.error('Pin error:', error);

    // 記錄詳細錯誤信息用於調試
    console.error(
      `Pin operation failed for user: ${userId}, item: ${itemId}, type: ${normalizedType}`,
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
    );

    return { success: false, error: 'SERVER_ERROR' };
  }
}
