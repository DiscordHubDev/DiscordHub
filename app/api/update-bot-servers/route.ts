import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchBotServerCount(botId: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://getbotserver.dawngs.top/get_bot_server_count`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bot_id: botId }),
      },
    );

    if (!res.ok) {
      console.error(`❌ 無法取得 ${botId} 的 server count`);
      return null;
    }

    const data = await res.json();
    return data.server_count ?? null;
  } catch (error) {
    console.error(`❌ ${botId} 發生錯誤：`, error);
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

  try {
    const bots = await prisma.bot.findMany({
      where: { status: 'approved' },
      orderBy: { servers: 'desc' },
    });
    const updatedBots: {
      name: string;
      prevServers: number;
      servers: number;
    }[] = [];

    for (const bot of bots) {
      const prevServers = bot.servers;
      const count = await fetchBotServerCount(bot.id);

      if (count !== null) {
        await prisma.bot.update({
          where: { id: bot.id },
          data: { servers: count },
        });

        updatedBots.push({
          name: bot.name,
          prevServers,
          servers: count,
        });
      }

      await sleep(10000);
    }

    return NextResponse.json({
      ok: true,
      updated: updatedBots,
    });
  } catch (err) {
    console.error('❌ 更新時發生錯誤', err);
    return NextResponse.json({ ok: false, error: '更新失敗' }, { status: 500 });
  }
}
