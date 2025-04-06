import { ServerType } from "@/lib/prisma_type";
import ServerCard from "./server-card";

type ServerListProps = {
  servers: ServerType[];
};

export default function ServerList({ servers }: ServerListProps) {
  return (
    <div className="space-y-4">
      {servers.map((server) => (
        <ServerCard key={server.id} server={server} />
      ))}
    </div>
  );
}
