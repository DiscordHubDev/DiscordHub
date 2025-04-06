import { getAllServers, getServerByGuildId } from "@/lib/actions/servers";
import { notFound } from "next/navigation";
import ServerDetailClientPage from "./client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

interface ServerDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ServerDetailPage({
  params,
}: ServerDetailPageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.discordProfile?.id;

  const server = await getServerByGuildId(userId, params.id);
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
