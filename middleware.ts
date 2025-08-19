import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const allowedIds = ['549056425943629825', '857502876108193812'];

const ALLOWED_ORIGINS = new Set<string>([
  'https://dchubs.org',
  'http://localhost:3000',
]);

function makeToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname, origin } = req.nextUrl;

    const method = req.method.toUpperCase();
    const isStateChanging = !['GET', 'HEAD', 'OPTIONS'].includes(method);

    if (isStateChanging) {
      const reqOrigin = req.headers.get('origin');
      const referer = req.headers.get('referer');
      const source = reqOrigin ?? (referer ? new URL(referer).origin : null);

      if (!source || !ALLOWED_ORIGINS.has(source)) {
        return new NextResponse('Forbidden (CSRF: bad origin)', {
          status: 403,
        });
      }
    }

    if (pathname.startsWith('/admin')) {
      if (
        token?.discordProfile?.id &&
        !allowedIds.includes(token.discordProfile.id)
      ) {
        return NextResponse.redirect(`${origin}/unauthorized/`);
      }
    }

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
