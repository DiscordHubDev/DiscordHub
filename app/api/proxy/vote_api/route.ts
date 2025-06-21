import { NextRequest, NextResponse } from 'next/server';

type VoteRequestBody = {
  type: 'bot' | 'server';
  user: {
    id: string;
    username: string;
    avatar: string;
  };
  target: {
    id: string;
    name: string;
    VoteNotificationURL: string;
    secret?: string;
  };
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as VoteRequestBody;

  const { type, user, target } = body;

  if (!target?.VoteNotificationURL) {
    return NextResponse.json(
      { error: 'Missing VoteNotificationURL' },
      { status: 400 },
    );
  }

  const url = target.VoteNotificationURL;
  const isDiscordWebhook = url.startsWith('https://discord.com/api/webhooks/');

  const payload = isDiscordWebhook
    ? {
        content: `<@${user.id}>`,
        embeds: [
          {
            author: {
              name: user.username,
              icon_url: user.avatar,
            },
            title: '❤️ | 感謝投票!',
            url: 'https://dchubs.org',
            description: `感謝您的支持與投票！您的每一票都是讓${type === 'bot' ? '機器人' : '伺服器'}變得更好的動力。\n\n請記得每 12 小時可以再回來 [DcHubs](https://dchubs.org/${type === 'bot' ? 'bots' : 'servers'}/${target.id}) 投票一次，讓更多人發現我們的${type === 'bot' ? '機器人' : '伺服器'}吧！✨`,
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

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!isDiscordWebhook && target.secret) {
    headers['x-api-secret'] = target.secret;
  }

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const text = await resp.text();
    console.log('body', text);

    if (!resp.ok) {
      return NextResponse.json(
        { error: 'Failed to forward vote' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
