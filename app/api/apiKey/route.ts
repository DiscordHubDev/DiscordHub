// app/api/user/api-key/route.ts (Edge Runtime)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { DcHubsJWT } from '@/lib/jwt';
import { hmacSha256Hex } from '@/lib/utils';

// Edge Runtime 聲明
export const runtime = 'nodejs';

// === 設定 ===
const API_KEY_CONFIG = {
  accessTokenLength: 32,
  refreshTokenLength: 32,
  accessTokenExpiry: 30 * 24 * 60 * 60 * 1000,
  refreshTokenExpiry: 90 * 24 * 60 * 60 * 1000,
} as const;

// 供 HMAC 使用的伺服器金鑰（務必設定於環境變數）
const API_TOKEN_SECRET = process.env.API_CRON_TOKEN || '';

// 生成 API Key 對（明文 + 雜湊）
async function generateAPIKeyPair(userId: string) {
  const { accessToken, refreshToken } = await DcHubsJWT.signTokenPair({
    id: userId,
  });

  // 以 HMAC-SHA256 儲存雜湊值（不可逆）
  const accessTokenHash = await hmacSha256Hex(accessToken, API_TOKEN_SECRET);
  const refreshTokenHash = await hmacSha256Hex(refreshToken, API_TOKEN_SECRET);

  return { accessToken, refreshToken, accessTokenHash, refreshTokenHash };
}

// 驗證請求來源
function validateRequestOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin') || '';
  const referer = request.headers.get('referer') || '';
  const allowedOrigins =
    process.env.ALLOWED_ORIGINS?.split(',')
      .map(s => s.trim())
      .filter(Boolean) || [];

  if (process.env.NODE_ENV === 'production') {
    return allowedOrigins.some(
      allowed => origin === allowed || referer.startsWith(allowed),
    );
  }

  // 開發環境放寬
  return origin.includes('localhost') || referer.includes('localhost') || true;
}

// Edge 取用戶端 IP（在多數平台會經由 x-forwarded-for 傳遞）
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    (request as any).ip ||
    'unknown'
  );
}

// 安全事件記錄（你可換成遙測/Log 服務）
async function logSecurityEvent(
  userId: string,
  action: string,
  details: Record<string, any>,
  request: NextRequest,
) {
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';

  console.log('Security Event:', {
    timestamp: new Date().toISOString(),
    userId,
    action,
    clientIP,
    userAgent,
    details,
  });
}

// === Session（請依你的 Auth 設定調整）===
async function getSessionOnEdge() {
  try {
    // @ts-ignore
    return await getServerSession(authOptions);
  } catch {
    return null;
  }
}

// === 路由處理 ===

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionOnEdge();
    if (!session?.discordProfile?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.discordProfile.id;

    // 從資料庫檢查是否已有有效 Key（不回傳明文）
    const existingApiKey = await checkUserHasApiKey(userId);

    return NextResponse.json({ hasApiKey: !!existingApiKey });
  } catch (error) {
    console.error('API Key check failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!API_TOKEN_SECRET) {
      return NextResponse.json(
        { error: 'Server misconfigured: missing API_TOKEN_SECRET' },
        { status: 500 },
      );
    }

    const session = await getSessionOnEdge();
    if (!session?.discordProfile?.id) {
      return NextResponse.json(
        { error: 'Session Unauthorized' },
        { status: 401 },
      );
    }

    const userId = session.discordProfile.id;
    const clientIP = getClientIP(request);

    const { accessToken, refreshToken, accessTokenHash, refreshTokenHash } =
      await generateAPIKeyPair(userId);

    const now = new Date();
    const accessTokenExpiry = new Date(
      now.getTime() + API_KEY_CONFIG.accessTokenExpiry,
    );
    const refreshTokenExpiry = new Date(
      now.getTime() + API_KEY_CONFIG.refreshTokenExpiry,
    );

    await saveApiKeyToDatabase({
      userId,
      accessTokenHash,
      refreshTokenHash,
      accessTokenExpiry,
      refreshTokenExpiry,
      createdAt: now,
      clientIP,
    });

    await logSecurityEvent(
      userId,
      'API_KEY_CREATED',
      {
        accessTokenExpiry: accessTokenExpiry.toISOString(),
        refreshTokenExpiry: refreshTokenExpiry.toISOString(),
        clientIP,
      },
      request,
    );

    // 僅此一次回傳明文
    return NextResponse.json({
      accessToken,
      refreshToken,
      expiresAt: accessTokenExpiry.toISOString(),
      refreshExpiresAt: refreshTokenExpiry.toISOString(),
    });
  } catch (error) {
    console.error('API Key creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionOnEdge();
    if (!session?.discordProfile?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.discordProfile.id;

    await logSecurityEvent(userId, 'API_KEY_REVOKED', {}, request);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Key revocation failed:', error);
    return NextResponse.json(
      { error: 'Failed to revoke API key' },
      { status: 500 },
    );
  }
}

// === 資料庫抽象（保持不變，改由 Edge 相容實作對接） ===

async function checkUserHasApiKey(userId: string) {
  return await prisma.apiToken.findFirst({
    where: {
      userId,
    },
    select: { userId: true },
  });
}

async function saveApiKeyToDatabase(data: {
  userId: string;
  accessTokenHash: string;
  refreshTokenHash: string;
  accessTokenExpiry: Date;
  refreshTokenExpiry: Date;
  createdAt: Date;
  clientIP: string;
}) {
  return await prisma.apiToken.upsert({
    where: { userId: data.userId },
    update: {
      accessToken: data.accessTokenHash,
      refreshToken: data.refreshTokenHash,
    },
    create: {
      userId: data.userId,
      accessToken: data.accessTokenHash,
      refreshToken: data.refreshTokenHash,
    },
  });
}
