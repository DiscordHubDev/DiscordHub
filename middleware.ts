import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// 配置常數
const allowedIds = ['549056425943629825', '857502876108193812'];
const ALLOWED_ORIGINS = new Set([
  'https://dchubs.org',
  'https://www.dchubs.org',
]);

// NextAuth JWT 配置
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

// Rate Limiting 配置
const RATE_LIMIT_CONFIG = {
  api: { requests: 60, window: 60 * 1000 }, // 每分鐘 60 次
  user_api: { requests: 150, window: 60 * 1000 }, // 用戶 API 限制更嚴格
  external_api: { requests: 150, window: 60 * 1000 }, // 外部 Bearer API 限制
  strict: { requests: 5, window: 60 * 1000 }, // 每分鐘 5 次
};

// 儲存 rate limit 數據的 Map
const rateLimitStore = new Map<
  string,
  { count: number; resetTime: number; violations: number }
>();

// 可疑 IP 黑名單（臨時）
const suspiciousIPs = new Set<string>();

// 清理過期的 rate limit 記錄
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// 獲取客戶端 IP
function getClientIP(req: NextRequest): string {
  const xForwardedFor = req.headers.get('x-forwarded-for');
  const xRealIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');

  return (
    cfConnectingIP ||
    xRealIP ||
    (xForwardedFor ? xForwardedFor.split(',')[0].trim() : '') ||
    '' ||
    'unknown'
  );
}

// 從請求中提取 Bearer token
function extractBearerToken(req: NextRequest): string | null {
  const authorization = req.headers.get('authorization');

  if (!authorization) {
    return null;
  }

  // 檢查是否為 Bearer token 格式
  const bearerMatch = authorization.match(/^Bearer\s+(.+)$/);
  if (!bearerMatch) {
    return null;
  }

  return bearerMatch[1];
}

// 驗證 NextAuth JWT Token
async function verifyNextAuthToken(
  req: NextRequest,
  token: string,
): Promise<any | null> {
  try {
    const decoded = await getToken({
      req: req,
      secret: NEXTAUTH_SECRET,
      raw: false,
    });

    return decoded;
  } catch (error) {
    console.warn('NextAuth JWT verification failed:', error);
    return null;
  }
}

// Rate Limiting 檢查
function checkRateLimit(
  identifier: string, // 可以是 IP 或者 userId
  endpoint: string,
  config: { requests: number; window: number },
): { allowed: boolean; remaining: number; resetTime: number } {
  const key = `${identifier}:${endpoint}`;
  const now = Date.now();

  let data = rateLimitStore.get(key);

  if (!data || now > data.resetTime) {
    data = {
      count: 0,
      resetTime: now + config.window,
      violations: data?.violations || 0,
    };
  }

  if (data.count >= config.requests) {
    // 記錄違規次數
    data.violations++;
    rateLimitStore.set(key, data);

    // 如果違規次數過多，加入可疑 IP 列表（僅對 IP 地址）
    if (data.violations >= 3 && identifier.includes('.')) {
      suspiciousIPs.add(identifier);
    }

    return {
      allowed: false,
      remaining: 0,
      resetTime: data.resetTime,
    };
  }

  data.count++;
  rateLimitStore.set(key, data);

  return {
    allowed: true,
    remaining: config.requests - data.count,
    resetTime: data.resetTime,
  };
}

// 檢測可疑請求模式
function detectSuspiciousActivity(req: NextRequest, ip: string): boolean {
  const userAgent = req.headers.get('user-agent') || '';
  const pathname = req.nextUrl.pathname;

  // 檢查是否在黑名單中
  if (suspiciousIPs.has(ip)) {
    return true;
  }

  // 對於 API 端點，允許程式化訪問的 User Agent
  if (pathname.startsWith('/api/v1/user')) {
    return false;
  }

  // 檢查可疑的 User Agent（僅對非 API 端點）
  const suspiciousUserAgents = [
    'python-requests',
    'curl/',
    'wget/',
    'scrapy',
    'bot',
    'spider',
    'crawler',
  ];

  if (
    suspiciousUserAgents.some(agent =>
      userAgent.toLowerCase().includes(agent.toLowerCase()),
    )
  ) {
    return true;
  }

  // 檢查可疑路徑模式
  const suspiciousPaths = [
    '/.env',
    '/wp-admin',
    '/admin.php',
    '/phpmyadmin',
    '/.git',
    '/config',
    '/backup',
  ];

  if (suspiciousPaths.some(path => pathname.includes(path))) {
    return true;
  }

  // 檢查是否缺少必要的標頭（對 API 端點放寬要求）
  if (
    !pathname.startsWith('/api') &&
    !req.headers.get('accept') &&
    !req.headers.get('user-agent')
  ) {
    return true;
  }

  return false;
}

// 安全標頭設置
function addSecurityHeaders(response: NextResponse): NextResponse {
  // 防止 XSS 攻擊
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy - 修改為允許 Discord widget
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; frame-src 'self' https://discord.com https://*.discord.com;",
  );

  // 防止點擊劫持 - 修改為允許特定來源
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  return response;
}

// 創建 rate limit 響應
function createRateLimitResponse(resetTime: number): NextResponse {
  const response = new NextResponse('Too Many Requests', { status: 429 });
  response.headers.set(
    'Retry-After',
    Math.ceil((resetTime - Date.now()) / 1000).toString(),
  );
  response.headers.set('X-RateLimit-Limit', 'exceeded');
  return addSecurityHeaders(response);
}

// 創建未授權響應
function createUnauthorizedResponse(
  message: string = 'Unauthorized',
): NextResponse {
  const response = new NextResponse(
    JSON.stringify({
      error: message,
      code: 'UNAUTHORIZED',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  return addSecurityHeaders(response);
}

// 主要中間件函數
export default withAuth(
  async function middleware(req) {
    const { token } = req.nextauth;
    const { pathname, origin } = req.nextUrl;
    const method = req.method.toUpperCase();
    const ip = getClientIP(req);

    // 定期清理過期記錄
    if (Math.random() < 0.01) {
      // 1% 機率執行清理
      cleanupRateLimitStore();
    }

    // 檢測可疑活動
    if (detectSuspiciousActivity(req, ip)) {
      console.warn(
        `Suspicious activity detected from IP: ${ip}, Path: ${pathname}, UA: ${req.headers.get(
          'user-agent',
        )}`,
      );
      return new NextResponse('Forbidden', { status: 403 });
    }

    // ========== /api/v1/user NextAuth JWT 驗證 ==========
    if (pathname.startsWith('/api/v1/user')) {
      let authenticatedUser: any = null;
      let authSource: 'bearer' | 'nextauth' = 'nextauth';

      // 首先嘗試 Bearer token 驗證
      const bearerToken = extractBearerToken(req);
      if (bearerToken) {
        authenticatedUser = await verifyNextAuthToken(req, bearerToken);
        authSource = 'bearer';

        if (!authenticatedUser) {
          console.warn(
            `Invalid Bearer token from IP: ${ip}, Path: ${pathname}`,
          );
          return createUnauthorizedResponse(
            'Invalid or expired NextAuth JWT token',
          );
        }
      }
      // 如果沒有 Bearer token，使用當前的 NextAuth session token
      else if (token && token.discordProfile?.id) {
        authenticatedUser = token;
        authSource = 'nextauth';
      }
      // 都沒有的話，拒絕訪問
      else {
        console.warn(
          `No valid authentication from IP: ${ip}, Path: ${pathname}`,
        );
        return createUnauthorizedResponse(
          'Authentication required: provide NextAuth Bearer token or login',
        );
      }

      // 驗證必要的用戶信息
      if (!authenticatedUser.discordProfile?.id) {
        console.warn(
          `Invalid token structure from IP: ${ip}, Path: ${pathname}`,
        );
        return createUnauthorizedResponse('Invalid token structure');
      }

      // 記錄 API 訪問
      console.log(
        `User API access [${authSource}]: ${
          authenticatedUser.discordProfile.id
        } (${
          authenticatedUser.discordProfile.username || authenticatedUser.name
        }) -> ${pathname}`,
      );

      // 將用戶信息添加到請求標頭，供後續 API 使用
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set(
        'x-user-id',
        authenticatedUser.sub || authenticatedUser.discordProfile.id,
      );
      requestHeaders.set('x-discord-id', authenticatedUser.discordProfile.id);
      requestHeaders.set(
        'x-username',
        authenticatedUser.discordProfile.username ||
          authenticatedUser.name ||
          '',
      );
      requestHeaders.set('x-email', authenticatedUser.email || '');
      requestHeaders.set('x-auth-source', authSource);

      // 使用用戶 ID 進行 rate limiting（而不是 IP）
      const rateLimitIdentifier = `user:${authenticatedUser.discordProfile.id}`;
      const rateLimitConfig =
        authSource === 'bearer'
          ? RATE_LIMIT_CONFIG.external_api
          : RATE_LIMIT_CONFIG.user_api;

      const rateLimit = checkRateLimit(
        rateLimitIdentifier,
        'user_api',
        rateLimitConfig,
      );

      if (!rateLimit.allowed) {
        console.warn(
          `Rate limit exceeded for user: ${authenticatedUser.discordProfile.id}, Auth: ${authSource}`,
        );
        return createRateLimitResponse(rateLimit.resetTime);
      }

      // 創建響應並繼續處理
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      addSecurityHeaders(response);

      // 添加 rate limit 資訊到響應標頭
      response.headers.set(
        'X-RateLimit-Remaining',
        rateLimit.remaining.toString(),
      );
      response.headers.set(
        'X-RateLimit-Reset',
        Math.ceil(rateLimit.resetTime / 1000).toString(),
      );
      response.headers.set('X-Auth-Source', authSource);
      response.headers.set('X-User-ID', authenticatedUser.discordProfile.id);

      return response;
    }

    // ========== 原有邏輯處理其他路徑 ==========

    // 根據路徑類型選擇 rate limit 配置
    let rateLimitConfig = RATE_LIMIT_CONFIG.api;
    let endpoint = 'api';

    if (pathname.startsWith('/api')) {
      rateLimitConfig = RATE_LIMIT_CONFIG.api;
      endpoint = 'api';
    }

    // 對可疑 IP 使用更嚴格的限制
    if (suspiciousIPs.has(ip)) {
      rateLimitConfig = RATE_LIMIT_CONFIG.strict;
      endpoint = 'strict';
    }

    // 執行 rate limiting 檢查
    const rateLimit = checkRateLimit(ip, endpoint, rateLimitConfig);

    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for IP: ${ip}, Endpoint: ${endpoint}`);
      return createRateLimitResponse(rateLimit.resetTime);
    }

    // 原有的 CSRF 保護邏輯
    const isStateChanging = !['GET', 'HEAD', 'OPTIONS'].includes(method);
    const reqOrigin = req.headers.get('origin');
    const referer = req.headers.get('referer');

    let source: string | null = null;
    try {
      source = reqOrigin ?? (referer ? new URL(referer).origin : null);
    } catch {
      source = null;
    }

    const isSameOrigin = !!source && source === req.nextUrl.origin;
    const allowedOrigin = isSameOrigin || ALLOWED_ORIGINS.has(source ?? '');

    // CSRF 保護：狀態變更請求必須來自允許的來源（但對 API Bearer token 豁免）
    if (
      isStateChanging &&
      !allowedOrigin &&
      !pathname.startsWith('/api/v1/user')
    ) {
      console.warn(`CSRF attempt detected from IP: ${ip}, Origin: ${source}`);
      return new NextResponse('Forbidden (CSRF: bad origin)', { status: 403 });
    }

    // 額外的 API 安全檢查
    if (
      pathname.startsWith('/api') &&
      isStateChanging &&
      !pathname.startsWith('/api/v1/user')
    ) {
      // 檢查 Content-Type
      const contentType = req.headers.get('content-type');
      if (
        !contentType ||
        (!contentType.includes('application/json') &&
          !contentType.includes('application/x-www-form-urlencoded'))
      ) {
        return new NextResponse('Invalid Content-Type', { status: 400 });
      }

      // 檢查是否有 CSRF token（對於非同源請求）
      if (!isSameOrigin && !req.headers.get('x-csrf-token')) {
        return new NextResponse('CSRF token required', { status: 403 });
      }
    }

    // 管理員路由保護
    if (pathname.startsWith('/admin')) {
      if (
        token?.discordProfile?.id &&
        !allowedIds.includes(token.discordProfile.id)
      ) {
        console.warn(
          `Unauthorized admin access attempt from IP: ${ip}, User ID: ${token.discordProfile.id}`,
        );
        return NextResponse.redirect(`${origin}/unauthorized/`);
      }
    }

    // 創建響應並添加安全標頭
    const response = NextResponse.next();
    addSecurityHeaders(response);

    // 添加 rate limit 資訊到響應標頭
    response.headers.set(
      'X-RateLimit-Remaining',
      rateLimit.remaining.toString(),
    );
    response.headers.set(
      'X-RateLimit-Reset',
      Math.ceil(rateLimit.resetTime / 1000).toString(),
    );

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // 對於 /api/v1/user 路徑，允許通過（會在 middleware 中進行驗證）
        if (req.nextUrl.pathname.startsWith('/api/v1/user')) {
          return true; // 讓自定義驗證邏輯處理
        }
        // 其他路徑保持原有邏輯
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/v1/user/:path*', // 包含所有 /api/v1/user 路徑
    '/api/pin/:path*',
    '/api/vote_api/:path*',
    '/api/((?!update_server_stats|update_bot_servers|check_servers|auth|pin|vote_api|inbox/).)*',
  ],
};
