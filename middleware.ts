import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const allowedIds = ['549056425943629825', '857502876108193812'];
const ALLOWED_ORIGINS = new Set([
  'https://dchubs.org',
  'https://www.dchubs.org',
  'http://localhost:3000',
]);

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname, origin } = req.nextUrl;

    const method = req.method.toUpperCase();
    const isStateChanging = !['GET', 'HEAD', 'OPTIONS'].includes(method);

    // Origin validation for state-changing requests
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

    // Origin-based CSRF protection for state-changing requests
    if (isStateChanging && !allowedOrigin) {
      return new NextResponse('Forbidden (CSRF: bad origin)', { status: 403 });
    }

    // Admin route protection
    if (pathname.startsWith('/admin')) {
      if (
        token?.discordProfile?.id &&
        !allowedIds.includes(token.discordProfile.id)
      ) {
        return NextResponse.redirect(`${origin}/unauthorized/`);
      }
    }

    return NextResponse.next();
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
    // 只匹配需要驗證的 API 路由，排除不需要驗證的路由
    '/api/((?!update_server_stats|update_bot_servers|check_servers|auth/).)*',
  ],
};
