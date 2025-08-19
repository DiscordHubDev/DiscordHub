import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const allowedIds = ['549056425943629825', '857502876108193812'];

const ALLOWED_ORIGINS = new Set<string>([
  'https://dchubs.org',
  'https://www.dchubs.org',
  'http://localhost:3000',
]);

function makeToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  const b64 = btoa(binary);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

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
    } catch {
      source = null;
    }

    const isSameOrigin = !!source && source === req.nextUrl.origin;
    const allowedOrigin = isSameOrigin || ALLOWED_ORIGINS.has(source ?? '');

    // 對狀態改變請求做 CSRF cookie 檢查，並回應時下發 CSRF
    if (isStateChanging) {
      const hasCsrf = !!req.cookies.get('csrfToken')?.value;
      if (!hasCsrf) {
        // 種下 CSRF，但不中斷流程
        const res = NextResponse.next();
        res.cookies.set('csrfToken', makeToken(), {
          httpOnly: false,
          sameSite: 'strict',
          secure: true,
          path: '/',
          maxAge: 60 * 60 * 2,
          domain: '.dchubs.org',
        });
        return res;
      }
    }

    if (isStateChanging && !allowedOrigin) {
      return new NextResponse('Forbidden (CSRF: bad origin)', { status: 403 });
    }

    // /admin 保護：只允許 allowlist 的 Discord ID
    if (pathname.startsWith('/admin')) {
      if (
        token?.discordProfile?.id &&
        !allowedIds.includes(token.discordProfile.id)
      ) {
        return NextResponse.redirect(`${origin}/unauthorized/`);
      }
    }

    // 順帶發 CSRF（若尚未有）
    const res = NextResponse.next();
    const csrfCookie = req.cookies.get('csrfToken')?.value;
    if (!csrfCookie) {
      res.cookies.set('csrfToken', makeToken(), {
        httpOnly: false,
        sameSite: 'strict',
        secure: true,
        path: '/',
        maxAge: 60 * 60 * 2,
      });
    }

    return res;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
