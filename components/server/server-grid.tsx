import { ServerCard } from "./server-card";

interface ServerGridProps {
  servers: Array<{
    id: string;
    name: string;
    icon: string;
    banner: string;
    memberCount?: number;
    isInServer: boolean;
  }>;
}

export function ServerGrid({ servers }: ServerGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {servers.map((server) => (
        <ServerCard key={server.id} server={server} />
      ))}
    </div>
  );
}
