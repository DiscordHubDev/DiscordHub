// api/v1/user/guest/refresh_token/route.ts
import { NextRequest } from 'next/server';
import { refreshAccessToken, DiscordToken } from '@/lib/utils'; // 這裡的 DiscordToken、refreshAccessToken 就是你上一則定義的

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const incoming = body.token as DiscordToken;

    const updated = await refreshAccessToken(incoming);

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'RefreshAccessTokenError' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
