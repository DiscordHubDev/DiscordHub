import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const BOT_TOKEN = process.env.BOT_TOKEN;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function safeFetchWithRateLimit(url: string, options: RequestInit) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.error(`Fetch failed: ${res.status} ${url}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error('Fetch error:', err);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  const servers = await prisma.server.findMany();

  for (const server of servers) {
    const guildId = server.id;

    const data = await safeFetchWithRateLimit(
      `https://discord.com/api/guilds/${guildId}?with_counts=true`,
      {
        headers: {
          Authorization: `Bot ${BOT_TOKEN}`,
        },
      },
    );

    if (!data) continue;

    await prisma.server.update({
      where: { id: guildId },
      data: {
        members: data.approximate_member_count ?? server.members,
        online: data.approximate_presence_count ?? server.online ?? 0,
      },
    });
    await sleep(3000);
  }

  return NextResponse.json({ ok: true });
}
