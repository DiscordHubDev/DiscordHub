import {
  getAllServers,
  getServerByGuildId,
  getServerWithFavoritedByGuildId,
} from '@/lib/actions/servers';
import { notFound } from 'next/navigation';
import ServerDetailClientPage from './client';
import { authOptions } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { Metadata } from 'next';

const allServers = await getAllServers();

export async function generateStaticParams() {
  return allServers.map(server => ({
    id: server.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const server = await getServerByGuildId(id);

  if (!server) return {};

  return {
    title: `${server.name} - ${server.tags.slice(0, 3).join(' / ')} Discord 伺服器 | DiscordHubs`,
    description: server.description,
    icons: {
      icon: 'https://i.imgur.com/l7H7ALj.png',
    },
    alternates: {
      canonical: `https://dchubs.org/servers/${server.id}`,
    },
    openGraph: {
      title: `${server.name} - ${server.tags.slice(0, 3).join(' / ')} Discord 伺服器 | DiscordHubs`,
      description: server.description,
      url: `https://dchubs.org/servers/${server.id}`,
      images: [
        {
          url: `${server.icon || 'https://cdn.discordapp.com/embed/avatars/0.png'}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${server.name} - ${server.tags.slice(0, 3).join(' / ')} Discord 伺服器 | DiscordHubs`,
      description: server.description,
      images: [
        `${server.icon || 'https://cdn.discordapp.com/embed/avatars/0.png'}`,
      ],
    },
  };
}

export default async function ServerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  const userId = session?.discordProfile?.id;

  const server = await getServerWithFavoritedByGuildId(userId, id);

  const isFavorited = !!server.favoritedBy?.length;

  if (!server) {
    notFound();
  }

  return (
    <ServerDetailClientPage
      server={server}
      allServers={allServers}
      isFavorited={isFavorited}
    />
  );
}
