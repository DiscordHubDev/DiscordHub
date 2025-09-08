import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type VoteType = 'bot' | 'server';
type ClientBody = {
  type: VoteType;
  user: { id: string; username: string; avatar: string };
  targetId: string;
};
type TargetRecord = { id: string; name: string; url: string; secret?: string };

const enc = new TextEncoder();

function timingSafeEqualStr(a: string, b: string) {
  const aa = enc.encode(a),
    bb = enc.encode(b);
  if (aa.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < aa.length; i++) diff |= aa[i] ^ bb[i];
  return diff === 0;
}

function toHex(ab: ArrayBuffer) {
  const view = new Uint8Array(ab);
  let out = '';
  for (let i = 0; i < view.length; i++)
    out += view[i].toString(16).padStart(2, '0');
  return out;
}

async function signBodyHMAC(secret: string, body: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body));
  return toHex(sig);
}

async function getTargetById(
  type: VoteType,
  targetId: string,
): Promise<TargetRecord | null> {
  if (type === 'bot') {
    const bot = await prisma.bot.findUnique({ where: { id: targetId } });
    return bot
      ? {
          id: bot.id,
          name: bot.name,
          url: bot.VoteNotificationURL || '',
          secret: bot.secret ?? undefined,
        }
      : null;
  } else {
    const server = await prisma.server.findUnique({ where: { id: targetId } });
    return server
      ? {
          id: server.id,
          name: server.name,
          url: server.VoteNotificationURL || '',
          secret: server.secret ?? undefined,
        }
      : null;
  }
}

const ALLOWED_ORIGINS = new Set<string>([
  'https://dchubs.org',
  'https://www.dchubs.org',
  'http://localhost:3000',
]);

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // 1) 来源检查
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  let source: string | null = null;
  try {
    source = origin ?? (referer ? new URL(referer).origin : null);
  } catch {
    source = null;
  }
  const isSameOrigin = !!source && source === req.nextUrl.origin;
  const allowed = isSameOrigin || ALLOWED_ORIGINS.has(source ?? '');
  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
  }

  // 2) NextAuth.js CSRF 保护：验证从 getCsrfToken() 获取的 token
  const headerToken = req.headers.get('x-csrf-token') || '';
  // NextAuth.js 将 CSRF token 存储在这个 cookie 中
  const cookieToken = req.cookies.get('next-auth.csrf-token')?.value || '';

  if (
    !headerToken ||
    !cookieToken ||
    !timingSafeEqualStr(headerToken, cookieToken)
  ) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }

  // 3) 解析 Body
  let body: ClientBody;
  try {
    body = (await req.json()) as ClientBody;
  } catch {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 });
  }

  const { type, user, targetId } = body || {};
  if (!type || !user?.id || !user?.username || !targetId) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 },
    );
  }

  const target = await getTargetById(type, targetId);
  if (!target)
    return NextResponse.json({ error: 'Unknown target' }, { status: 404 });

  if (!target.url) {
    return NextResponse.json({ success: true, skipped: true });
  }

  const isDiscordWebhook = target.url.startsWith(
    'https://discord.com/api/webhooks/',
  );

  const payload = isDiscordWebhook
    ? {
        content: `<@${user.id}>`,
        embeds: [
          {
            author: { name: user.username, icon_url: user.avatar },
            title: '❤️ | 感謝投票!',
            url: 'https://dchubs.org',
            description: `感謝您的支持與投票！您的每一票都是讓${
              type === 'server' ? '伺服器' : '機器人'
            }變得更好的動力。\n\n請記得每 12 小時可以再回來 [DcHubs](https://dchubs.org/${
              type === 'bot' ? 'bots' : 'servers'
            }/${target.id}) 投票一次，讓更多人發現我們的${
              type === 'server' ? '伺服器' : '機器人'
            }吧！✨`,
            color: Math.floor(Math.random() * 0xffffff),
            footer: {
              text: 'Powered by DcHubs Vote System',
              icon_url:
                'https://images-ext-1.discordapp.net/external/UPq4fK1TpfNlL5xKNkZwqO02wPJoX-yd9IKkk5UnyP8/%3Fsize%3D512%26format%3Dwebp/https/cdn.discordapp.com/icons/1297055626014490695/365d960f0a44f9a0c2de4672b0bcdcc0.webp?format=webp',
            },
          },
        ],
      }
    : {
        userId: user.id,
        username: user.username,
        userAvatar: user.avatar,
        votedAt: new Date().toISOString(),
        itemId: target.id,
        itemType: type,
        itemName: target.name,
      };

  const bodyStr = JSON.stringify(payload);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!isDiscordWebhook && target.secret) {
    const ts = Date.now().toString();
    const signature = await signBodyHMAC(target.secret, ts + '.' + bodyStr);
    headers['x-signature'] = signature;
    headers['x-timestamp'] = ts;
    headers['Authorization'] = `Bearer ${target.secret}`;
  }

  // 6) 调用外部 webhook
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10_000);
    const r = await fetch(target.url, {
      method: 'POST',
      headers,
      body: bodyStr,
      signal: ctrl.signal,
      cache: 'no-store',
    });
    clearTimeout(t);

    if (!r.ok) {
      const text = await r.text().catch(() => '');
      return NextResponse.json(
        {
          success: false,
          upstreamStatus: r.status,
          upstreamBody: text.slice(0, 500),
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Unexpected error forwarding vote', {
      msg: String(error?.message || error),
    });
    return NextResponse.json(
      { error: 'Upstream network error' },
      { status: 502 },
    );
  }
}
