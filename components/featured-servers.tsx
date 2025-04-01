import type { ServerType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
import Link from "next/link"

interface FeaturedServersProps {
  servers: ServerType[]
}

export default function FeaturedServers({ servers }: FeaturedServersProps) {
  // Only show up to 3 featured servers
  const featuredServers = servers.slice(0, 3)

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">精選伺服器</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {featuredServers.map((server) => (
          <Link href={`/servers/${server.id}`} key={server.id} className="block">
            <div className="bg-[#2b2d31] rounded-lg overflow-hidden border border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200 flex flex-col h-full">
              {/* Banner */}
              <div className="h-32 bg-[#36393f] relative">
                <img
                  src={server.banner || "/placeholder.svg?height=128&width=256"}
                  alt={server.name}
                  className="w-full h-full object-cover"
                />
                {/* Server Icon */}
                <div className="absolute -bottom-6 left-4 w-12 h-12 rounded-full bg-[#36393f] border-4 border-[#2b2d31] overflow-hidden">
                  <img
                    src={server.icon || "/placeholder.svg?height=48&width=48"}
                    alt={server.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="p-4 pt-8 flex-grow">
                <h3 className="text-lg font-bold mb-2">{server.name}</h3>
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">{server.description}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {server.tags.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-[#36393f] hover:bg-[#4f545c] text-gray-300 text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {server.tags.length > 3 && (
                    <Badge variant="secondary" className="bg-[#36393f] text-gray-300 text-xs">
                      +{server.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center text-sm text-gray-400 mb-4">
                  <Users size={14} className="mr-1" />
                  <span>{server.members.toLocaleString()} 成員</span>
                  {server.online && (
                    <>
                      <div className="mx-2">•</div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                        <span>{server.online.toLocaleString()} 在線</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0 mt-auto">
                <Button size="sm" className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white">
                  加入伺服器
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

