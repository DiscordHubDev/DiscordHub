import { Users, ArrowUp, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";
import Link from "next/link";
import { ServerType } from "@/lib/prisma_type";

interface ServerCardProps {
  server: ServerType;
}

export default function ServerCard({ server }: ServerCardProps) {
  return (
    <Link href={`/servers/${server.id}`} className="block">
      <div className="bg-[#2b2d31] rounded-lg overflow-hidden border border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200">
        <div className="flex flex-col md:flex-row">
          {/* Server Banner (mobile) */}
          {server.banner && (
            <div className="w-full h-32 md:hidden">
              <img
                src={server.banner || "/placeholder.svg"}
                alt={`${server.name} banner`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex-grow p-4 md:p-5">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Server Icon */}
              <div className="hidden md:block flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-[#36393f] overflow-hidden">
                  <img
                    src={server.icon || "/placeholder.svg?height=64&width=64"}
                    alt={server.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Mobile header with icon */}
              <div className="flex items-center md:hidden mb-3">
                <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden mr-3">
                  <img
                    src={server.icon || "/placeholder.svg?height=40&width=40"}
                    alt={server.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold">{server.name}</h3>
              </div>

              <div className="flex-grow">
                {/* Server Name and Join Button (desktop) */}
                <div className="hidden md:flex md:flex-row md:items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">{server.name}</h3>
                  <div className="flex items-center">
                    <Button
                      size="sm"
                      className="bg-[#5865f2] hover:bg-[#4752c4] text-white"
                    >
                      加入伺服器
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 mb-4 line-clamp-2">
                  {server.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {server.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-[#36393f] hover:bg-[#4f545c] text-gray-300"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
                  <div className="flex items-center">
                    <Users size={16} className="mr-1" />
                    <span>{server.members.toLocaleString()} 成員</span>
                  </div>
                  <div className="flex items-center">
                    <ArrowUp size={16} className="mr-1" />
                    <span>{server.upvotes.toLocaleString()} 投票</span>
                  </div>
                  {server.online && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                      <span>{server.online.toLocaleString()} 在線</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    <span>
                      {formatDistanceToNow(new Date(server.createdAt), {
                        addSuffix: true,
                        locale: zhTW,
                      })}
                    </span>
                  </div>
                </div>

                {/* Join Button (mobile) */}
                <div className="mt-4 md:hidden">
                  <Button
                    size="sm"
                    className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white"
                  >
                    加入伺服器
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Server Banner (desktop) */}
          {server.banner && (
            <div className="hidden md:block w-48 h-auto bg-[#36393f] flex-shrink-0">
              <img
                src={server.banner || "/placeholder.svg"}
                alt={`${server.name} banner`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
