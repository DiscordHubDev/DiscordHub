import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { Duration, Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import {
  extractBearerToken,
  verifyJWTToken,
  createAuthenticatedUser,
} from '@/lib/auth';

// 初始化 Redis 連接
const redis = Redis.fromEnv();

// 創建不同的 rate limiter 實例
const createRateLimiter = (requests: number, window: Duration) => {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: 'dchubs_rl',
  });
};

// Rate limiting 配置與實例
const rateLimiters = {
  api: createRateLimiter(100, '1m'), // 每分鐘 60 次
  userApi: createRateLimiter(150, '1m'), // 用戶 API
  externalApi: createRateLimiter(150, '1m'), // 外部 Bearer API
  strict: createRateLimiter(5, '1m'), // 嚴格限制：每分鐘 5 次
  suspicious: createRateLimiter(10, '1h'), // 可疑 IP：每小時 10 次
} as const;

// 配置常數
const ALLOWED_IDS = ['549056425943629825', '857502876108193812'];
const ALLOWED_ORIGINS = new Set([
  'https://dchubs.org',
  'https://www.dchubs.org',
]);

// 可疑模式檢測配置
const SUSPICIOUS_PATTERNS = {
  userAgents: [
    'python-requests',
    'curl/',
    'wget/',
    'scrapy',
    'bot',
    'spider',
    'crawler',
  ],
  paths: [
    '/.env',
    '/wp-admin',
    '/admin.php',
    '/phpmyadmin',
    '/.git',
    '/config',
    '/backup',
  ],
} as const;

// 工具函數：獲取客戶端 IP
function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'unknown'
  );
}

// 工具函數：檢測可疑活動
function isSuspiciousRequest(req: NextRequest, ip: string): boolean {
  const userAgent = req.headers.get('user-agent')?.toLowerCase() || '';
  const pathname = req.nextUrl.pathname;

  // API 端點允許程式化訪問
  if (pathname.startsWith('/api/v1/user')) {
    return false;
  }

  // 檢查可疑 User Agent
  if (
    SUSPICIOUS_PATTERNS.userAgents.some(agent =>
      userAgent.includes(agent.toLowerCase()),
    )
  ) {
    return true;
  }

  // 檢查可疑路徑
  if (SUSPICIOUS_PATTERNS.paths.some(path => pathname.includes(path))) {
    return true;
  }

  // 檢查缺少必要標頭（非 API 端點）
  if (
    !pathname.startsWith('/api') &&
    !req.headers.get('accept') &&
    !req.headers.get('user-agent')
  ) {
    return true;
  }

  return false;
}

// 工具函數：添加安全標頭
function addSecurityHeaders(response: NextResponse): NextResponse {
  const headers = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self'",
      "frame-src 'self' https://discord.com https://*.discord.com",
    ].join('; '),
  };

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// 工具函數：創建 rate limit 響應
function createRateLimitResponse(resetTime?: number): NextResponse {
  const response = new NextResponse('Too Many Requests', { status: 429 });

  if (resetTime) {
    response.headers.set(
      'Retry-After',
      Math.ceil((resetTime - Date.now()) / 1000).toString(),
    );
  }

  response.headers.set('X-RateLimit-Limit', 'exceeded');
  return addSecurityHeaders(response);
}

// 工具函數：創建未授權響應
function createUnauthorizedResponse(message = 'Unauthorized'): NextResponse {
  const response = new NextResponse(
    JSON.stringify({
      error: message,
      code: 'UNAUTHORIZED',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    },
  );
  return addSecurityHeaders(response);
}

// 工具函數：執行 rate limiting 檢查
async function checkRateLimit(
  identifier: string,
  limiterKey: keyof typeof rateLimiters,
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  try {
    const result = await rateLimiters[limiterKey].limit(identifier);
    return result;
  } catch (error) {
    console.error('Rate limiting error:', error);
    // 如果 rate limiting 失敗，允許請求通過但記錄錯誤
    return { success: true, limit: 0, remaining: 0, reset: Date.now() };
  }
}

// 工具函數：檢查可疑 IP（使用 Redis）
async function checkSuspiciousIP(ip: string): Promise<boolean> {
  try {
    const key = `suspicious:${ip}`;
    const count = await redis.get(key);
    return (count as number) >= 3; // 3 次違規後標記為可疑
  } catch (error) {
    console.error('Suspicious IP check error:', error);
    return false;
  }
}

// 工具函數：標記可疑 IP
async function markSuspiciousIP(ip: string): Promise<void> {
  try {
    const key = `suspicious:${ip}`;
    await redis.incr(key);
    await redis.expire(key, 3600); // 1 小時過期
  } catch (error) {
    console.error('Mark suspicious IP error:', error);
  }
}

// 主要中間件函數
export default withAuth(
  async function middleware(req) {
    const { token } = req.nextauth;
    const { pathname, origin } = req.nextUrl;
    const method = req.method.toUpperCase();
    const ip = getClientIP(req);

    // 檢測可疑活動
    if (isSuspiciousRequest(req, ip)) {
      console.warn(`Suspicious activity from IP: ${ip}, Path: ${pathname}`);
      await markSuspiciousIP(ip);
      return new NextResponse('Forbidden', { status: 403 });
    }

    // ========== /api/v1/user 路徑處理 ==========
    if (pathname.startsWith('/api/v1/user')) {
      // 提取並驗證 Bearer token
      const bearerToken = extractBearerToken(req);
      if (!bearerToken) {
        return createUnauthorizedResponse('必須傳入 Bearer Token');
      }

      // 驗證 JWT Token
      const jwtPayload = await verifyJWTToken(bearerToken);
      if (!jwtPayload) {
        return createUnauthorizedResponse('無效的 Access Token');
      }

      const res = await fetch(new URL('/api/auth/jwt', req.url), {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-internal-secret': process.env.API_CRON_TOKEN!,
        },
        body: JSON.stringify({ token: bearerToken }),
      });

      if (!res.ok) {
        return NextResponse.json(
          { error: '傳入的 Access Token 已過期' },
          { status: 401 },
        );
      }

      // 創建認證用戶對象
      const authenticatedUser = createAuthenticatedUser(jwtPayload);
      if (!authenticatedUser.id) {
        return createUnauthorizedResponse('Invalid token payload');
      }

      // 用戶級別的 rate limiting
      const userRateLimit = await checkRateLimit(
        `user:${authenticatedUser.id}`,
        'externalApi',
      );

      if (!userRateLimit.success) {
        await markSuspiciousIP(ip);
        return createRateLimitResponse(userRateLimit.reset);
      }

      // 設置請求標頭
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', authenticatedUser.id);
      requestHeaders.set('x-discord-id', authenticatedUser.id);
      requestHeaders.set('x-auth-source', 'bearer');

      // 創建響應
      const response = NextResponse.next({
        request: { headers: requestHeaders },
      });

      // 添加標頭
      addSecurityHeaders(response);
      response.headers.set(
        'X-RateLimit-Remaining',
        userRateLimit.remaining.toString(),
      );
      response.headers.set(
        'X-RateLimit-Reset',
        Math.ceil(userRateLimit.reset / 1000).toString(),
      );
      response.headers.set('X-Auth-Source', 'bearer');
      response.headers.set('X-User-ID', authenticatedUser.id);

      return response;
    }

    // ========== 其他路徑的 rate limiting ==========

    // 檢查是否為可疑 IP
    const isSuspicious = await checkSuspiciousIP(ip);
    let rateLimiterKey: keyof typeof rateLimiters = 'api';

    if (isSuspicious) {
      rateLimiterKey = 'suspicious';
    } else if (pathname.startsWith('/api')) {
      rateLimiterKey = 'api';
    }

    // 執行 rate limiting
    const rateLimit = await checkRateLimit(ip, rateLimiterKey);

    if (!rateLimit.success) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      await markSuspiciousIP(ip);
      return createRateLimitResponse(rateLimit.reset);
    }

    // ========== CSRF 保護 ==========
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

    // CSRF 保護（排除 Bearer token API）
    if (
      isStateChanging &&
      !allowedOrigin &&
      !pathname.startsWith('/api/v1/user')
    ) {
      console.warn(`CSRF attempt from IP: ${ip}, Origin: ${source}`);
      return new NextResponse('Forbidden (CSRF)', { status: 403 });
    }

    // API 安全檢查
    if (
      pathname.startsWith('/api') &&
      isStateChanging &&
      !pathname.startsWith('/api/v1/user')
    ) {
      const contentType = req.headers.get('content-type');
      if (
        !contentType ||
        (!contentType.includes('application/json') &&
          !contentType.includes('application/x-www-form-urlencoded'))
      ) {
        return new NextResponse('Invalid Content-Type', { status: 400 });
      }

      if (!isSameOrigin && !req.headers.get('x-csrf-token')) {
        return new NextResponse('CSRF token required', { status: 403 });
      }
    }

    // 管理員路由保護
    if (pathname.startsWith('/admin')) {
      if (
        !token?.discordProfile?.id ||
        !ALLOWED_IDS.includes(token.discordProfile.id)
      ) {
        console.warn(`Unauthorized admin access from IP: ${ip}`);
        return NextResponse.redirect(`${origin}/unauthorized/`);
      }
    }

    // 創建最終響應
    const response = NextResponse.next();
    addSecurityHeaders(response);

    response.headers.set(
      'X-RateLimit-Remaining',
      rateLimit.remaining.toString(),
    );
    response.headers.set(
      'X-RateLimit-Reset',
      Math.ceil(rateLimit.reset / 1000).toString(),
    );

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith('/api/v1/user')) {
          return true;
        }
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/v1/user/:path*',
    '/api/((?!update_server_stats|update_bot_servers|check_servers|auth|vote_api|inbox/).)*',
  ],
};
