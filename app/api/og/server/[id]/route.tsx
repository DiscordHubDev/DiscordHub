import { getServerByGuildId } from '@/lib/actions/servers';
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const bot = await getServerByGuildId(context.params.id);

  if (!bot) return new Response('Not Found', { status: 404 });

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <img
          src={bot.icon || 'https://cdn.discordapp.com/embed/avatars/0.png'}
          width="512"
          height="512"
          style={{ borderRadius: '50%' }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
