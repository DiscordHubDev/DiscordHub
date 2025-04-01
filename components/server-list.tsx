import type { ServerType } from "@/lib/types"
import ServerCard from "./server-card"

interface ServerListProps {
  servers: ServerType[]
}

export default function ServerList({ servers }: ServerListProps) {
  return (
    <div className="space-y-4">
      {servers.map((server) => (
        <ServerCard key={server.id} server={server} />
      ))}
    </div>
  )
}

