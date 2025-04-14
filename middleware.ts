import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const allowedIds = ['549056425943629825' , '857502876108193812'];

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname, origin } = req.nextUrl;

    if (pathname.startsWith('/admin')) {
      console.log('user ID:', token?.discordProfile?.id);
      if (
        token?.discordProfile?.id &&
        !allowedIds.includes(token.discordProfile.id)
      ) {
        return NextResponse.redirect(`${origin}/unauthorized/`);
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

// 記得有 matcher！
export const config = {
  matcher: ['/admin/:path*'],
};
