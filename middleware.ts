import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

// 配置常數
const allowedIds = ['549056425943629825', '857502876108193812'];
const ALLOWED_ORIGINS = new Set([
  'https://dchubs.org',
  'https://www.dchubs.org',
  'http://localhost:3000',
]);

// Rate Limiting 配置
const RATE_LIMIT_CONFIG = {
  api: { requests: 60, window: 60 * 1000 }, // 每分鐘 60 次
  // 嚴格限制（懷疑惡意行為時）
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

// Rate Limiting 檢查
function checkRateLimit(
  ip: string,
  endpoint: string,
  config: { requests: number; window: number },
): { allowed: boolean; remaining: number; resetTime: number } {
  const key = `${ip}:${endpoint}`;
  const now = Date.now();
  const windowStart = now - config.window;

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

    // 如果違規次數過多，加入可疑 IP 列表
    if (data.violations >= 3) {
      suspiciousIPs.add(ip);
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

  // 檢查可疑的 User Agent
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

  // 檢查是否缺少必要的標頭
  if (!req.headers.get('accept') && !req.headers.get('user-agent')) {
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

// 主要中間件函數
export default withAuth(
  function middleware(req) {
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

    // CSRF 保護：狀態變更請求必須來自允許的來源
    if (isStateChanging && !allowedOrigin) {
      console.warn(`CSRF attempt detected from IP: ${ip}, Origin: ${source}`);
      return new NextResponse('Forbidden (CSRF: bad origin)', { status: 403 });
    }

    // 額外的 API 安全檢查
    if (pathname.startsWith('/api') && isStateChanging) {
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
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: [
    '/admin/:path*',
    // 匹配所有 API 路由進行安全檢查
    '/api/:path*',
    // 匹配需要保護的靜態資源
    '/((?!_next/static|_next/image|favicon.ico|public/).)*',
  ],
};
