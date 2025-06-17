import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { client_id } = await req.json();

    const discordRes = await fetch(
      `https://discord.com/api/v10/applications/${client_id}/rpc`,
      {
        headers: {
          'User-Agent': 'DiscordHubs/1.0',
        },
      },
    );

    if (!discordRes.ok) {
      return NextResponse.json(
        { error: 'Discord API failed' },
        { status: 400 },
      );
    }

    const data = await discordRes.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error(':x: Discord RPC Proxy Failed:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
