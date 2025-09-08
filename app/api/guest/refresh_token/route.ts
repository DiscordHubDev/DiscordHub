import { NextRequest, NextResponse } from 'next/server';
import { DcHubsJWT } from '@/lib/jwt';
import { extractBearerToken, verifyJWTRefreshToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      return NextResponse.json(
        { error: '需要有效的 Refresh Token' },
        { status: 401 },
      );
    }

    const payload = await verifyJWTRefreshToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: '無效或已過期的 Refresh Token' },
        { status: 401 },
      );
    }
    // 簽發新的 Token 對
    const newTokens = await DcHubsJWT.signTokenPair({ id: payload.id });

    // 記錄 API key 重設操作
    console.log(`API key reset for user: ${payload.id}`);

    await UpdateUserToken(payload.id, newTokens);

    return NextResponse.json({
      success: true,
      message: 'API key 已被重製. 之前的 API key 將不再有效.',
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    });
  } catch (error) {
    console.error('API key reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// 撤銷用戶所有 token 的實現函數
async function UpdateUserToken(
  userId: string,
  newTokens: {
    accessToken: string;
    refreshToken: string;
  },
): Promise<void> {
  await prisma.apiToken.update({
    where: { userId },
    data: {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    },
  });
}
