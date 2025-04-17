import ServerEditClient from './client';
import { getServerByGuildId } from '@/lib/actions/servers';

export default async function ServerEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const server = await getServerByGuildId(id);

  if (!server) return <div className="text-white p-4">找不到伺服器</div>;

  return <ServerEditClient server={server} />;
}
