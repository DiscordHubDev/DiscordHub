import { getBotListChunked } from '@/lib/actions/bots';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface BotInfo {
  global_name: string | null;
  avatar_url: string | null;
  banner_url: string | null;
}

async function fetchBotInfo(botId: string): Promise<BotInfo | null> {
  try {
    const res = await fetch(`https://dchub.mantou.dev/member/${botId}`);

    if (!res.ok) {
      console.error(`❌ 無法取得 ${botId} 的資訊，狀態碼: ${res.status}`);
      return null;
    }

    const data = await res.json();

    const global_name =
      typeof data.global_name === 'string' ? data.global_name : null;
    const avatar_url =
      typeof data.avatar_url === 'string' ? data.avatar_url : null;
    const banner_url =
      typeof data.banner_url === 'string' ? data.banner_url : null;

    return {
      global_name,
      avatar_url,
      banner_url,
    };
  } catch (error) {
    console.error(`❌ ${botId} 發生錯誤：`, error);
    return null;
  }
}

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
    const server_count = Array.isArray(data)
      ? data.find(item => typeof item.server_count === 'number')?.server_count
      : null;

    return server_count ?? null;
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
    const bots = await getBotListChunked();

    const updatedBots: {
      name: string;
      prevServers: number;
      servers: number;
    }[] = [];

    for (const bot of bots) {
      const prev = bot.servers;
      const updatedServerCount = await fetchBotServerCount(bot.id);
      const info = await fetchBotInfo(bot.id);

      if (updatedServerCount !== null) {
        await prisma.bot.update({
          where: { id: bot.id },
          data: {
            servers: updatedServerCount,
            name: info?.global_name ?? bot.name,
            icon: info?.avatar_url ?? bot.icon,
            banner: info?.banner_url ?? bot.banner,
          },
        });

        updatedBots.push({
          name: bot.name,
          prevServers: prev,
          servers: updatedServerCount,
        });
      }

      await sleep(5000);
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
