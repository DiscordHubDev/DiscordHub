import { getUserGuildsWithBotStatus } from '@/lib/get-user-guild';
import ServerClient from '@/components/server/server-home';
import { authOptions } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { getServerByGuildId } from '@/lib/actions/servers';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.access_token) {
    return redirect('/api/auth/signin?callbackUrl=/add-server');
  }

  const { activeServers, inactiveServers } = await getUserGuildsWithBotStatus(
    session.access_token,
  );

  // ✅ 加入 isPublished 判斷
  const activeWithStatus = await Promise.all(
    activeServers.map(async server => {
      const isPublished = await getServerByGuildId(server.id)
        .then(() => true)
        .catch(() => false);

      return {
        ...server,
        isPublished,
      };
    }),
  );

  return (
    <ServerClient
      activeServers={activeWithStatus}
      inactiveServers={inactiveServers}
    />
  );
}
