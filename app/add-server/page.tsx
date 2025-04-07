import { getUserGuildsWithBotStatus } from '@/lib/get-user-guild';

import ServerClient from '@/components/server/server-home';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  console.log('session?.access_token', session?.access_token);

  if (!session?.access_token) {
    return redirect('/api/auth/signin?callbackUrl=/add-server');
  }

  const { activeServers, inactiveServers } = await getUserGuildsWithBotStatus(
    session!.access_token!,
  );

  return (
    <ServerClient
      activeServers={activeServers}
      inactiveServers={inactiveServers}
    />
  );
}
