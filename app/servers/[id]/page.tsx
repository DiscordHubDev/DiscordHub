import { getAllServers, getServerByGuildId } from '@/lib/actions/servers';
import { notFound } from 'next/navigation';
import ServerDetailClientPage from './client';
import { authOptions } from '@/lib/utils';
import { getServerSession } from 'next-auth';

export default async function ServerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  const userId = session?.discordProfile?.id;

  const server = await getServerByGuildId(userId, id);
  const allServers = await getAllServers();

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
