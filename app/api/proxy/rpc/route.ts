import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { client_id } = await req.json();

    if (!client_id) {
      return NextResponse.json(
        { error: 'client_id is required' },
        { status: 400 },
      );
    }

    const discordRes = await fetch(
      `https://discord.com/api/v10/applications/${client_id}/rpc`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DiscordBot/2.0)',
          Accept: 'application/json',
        },
      },
    );

    if (!discordRes.ok) {
      const errorText = await discordRes.text();
      console.error('Discord API Error:', errorText);
      return NextResponse.json(
        { error: `Discord API failed: ${discordRes.status}` },
        { status: discordRes.status },
      );
    }

    const data = await discordRes.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Discord RPC Proxy Failed:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
