import { NextRequest, NextResponse } from 'next/server';

function issueCsrf(res: NextResponse) {
  const token = crypto.randomUUID();
  res.cookies.set('csrfToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
    domain: process.env.NODE_ENV === 'production' ? '.dchubs.org' : undefined,
  });
  return token;
}

export async function GET(_req: NextRequest) {
  const res = NextResponse.json({});
  const token = issueCsrf(res);
  // 直接回 token，前端拿去放 header
  return NextResponse.json({ csrfToken: token }, { headers: res.headers });
}
