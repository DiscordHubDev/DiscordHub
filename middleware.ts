import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const allowedIds = ['549056425943629825', '857502876108193812'];
const ALLOWED_ORIGINS = new Set([
  'https://dchubs.org',
  'https://www.dchubs.org',
  'http://localhost:3000',
]);

function makeToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = btoa(bin);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function genNonce() {
  // 產生隨機、不可預測的 nonce；用 webcrypto
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Buffer.from(bytes).toString('base64');
}

const CSRF_COOKIE_OPTS =
  process.env.NODE_ENV === 'production'
    ? {
        httpOnly: false,
        sameSite: 'strict' as const,
        secure: true,
        path: '/',
        maxAge: 60 * 60 * 2,
        domain: '.dchubs.org',
      }
    : {
        httpOnly: false,
        sameSite: 'lax' as const,
        secure: false,
        path: '/',
        maxAge: 60 * 60 * 2,
      };

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname, origin } = req.nextUrl;

    const method = req.method.toUpperCase();
    const isStateChanging = !['GET', 'HEAD', 'OPTIONS'].includes(method);

    const reqOrigin = req.headers.get('origin');
    const referer = req.headers.get('referer');
    let source: string | null = null;
    try {
      source = reqOrigin ?? (referer ? new URL(referer).origin : null);
    } catch {}
    const isSameOrigin = !!source && source === req.nextUrl.origin;
    const allowedOrigin = isSameOrigin || ALLOWED_ORIGINS.has(source ?? '');

    // 先準備回應
    const res = NextResponse.next();
    const nonce = genNonce();

    res.headers.set('x-csp-nonce', nonce);
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.example.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "require-trusted-types-for 'script'",
      'trusted-types nextjs#bundler',
    ].join('; ');
    res.headers.set('Content-Security-Policy', csp);

    // 沒有 CSRF cookie 就種一顆（無論 GET 或 POST）
    if (!req.cookies.get('csrfToken')?.value) {
      res.cookies.set('csrfToken', makeToken(), CSRF_COOKIE_OPTS);
    }

    // 來源檢查（只對 state-changing）
    if (isStateChanging && !allowedOrigin) {
      return new NextResponse('Forbidden (CSRF: bad origin)', { status: 403 });
    }

    // /admin 保護
    if (pathname.startsWith('/admin')) {
      if (
        token?.discordProfile?.id &&
        !allowedIds.includes(token.discordProfile.id)
      ) {
        return NextResponse.redirect(`${origin}/unauthorized/`);
      }
    }

    return res;
  },
  { callbacks: { authorized: ({ token }) => !!token } },
);

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
