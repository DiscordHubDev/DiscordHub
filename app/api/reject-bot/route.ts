import { NextResponse } from 'next/server';

const DISCORD_BOT_TOKEN = process.env.BOT_TOKEN;

async function sendDM(userId: string, botName: string, reason: string) {
  const channelRes = await fetch(
    'https://discord.com/api/v10/users/@me/channels',
    {
      method: 'POST',
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipient_id: userId }),
    },
  );

  if (!channelRes.ok) {
    throw new Error(`Failed to create DM channel for ${userId}`);
  }

  const channel = await channelRes.json();

  // 發送訊息
  const message = `❌ 您的機器人 **${
    botName ?? '未命名'
  }** 未通過審核。\n原因：${reason}`;
  const msgRes = await fetch(
    `https://discord.com/api/v10/channels/${channel.id}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: message }),
    },
  );

  if (!msgRes.ok) {
    throw new Error(`Failed to send DM to ${userId}`);
  }
}

export async function POST(req: Request) {
  try {
    const { userIds, botName, reason } = await req.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'Missing userIds' }, { status: 400 });
    }

    const results = [];
    for (const userId of userIds) {
      try {
        await sendDM(userId, botName, reason);
        results.push({ userId, success: true });
      } catch (err: any) {
        console.error(`Error sending DM to ${userId}:`, err.message);
        results.push({ userId, success: false, error: err.message });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error('Reject bot error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
