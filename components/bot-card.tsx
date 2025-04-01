import { Users, ArrowUp, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { BotType } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { zhTW } from "date-fns/locale"
import Link from "next/link"

interface BotCardProps {
  bot: BotType
}

export default function BotCard({ bot }: BotCardProps) {
  return (
    <Link href={`/bots/${bot.id}`} className="block">
      <div className="bg-[#2b2d31] rounded-lg overflow-hidden border border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200">
        <div className="flex flex-col md:flex-row">
          {/* Bot Banner (mobile) */}
          {bot.banner && (
            <div className="w-full h-32 md:hidden">
              <img
                src={bot.banner || "/placeholder.svg"}
                alt={`${bot.name} banner`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex-grow p-4 md:p-5">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Bot Icon */}
              <div className="hidden md:block flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-[#36393f] overflow-hidden">
                  <img
                    src={bot.icon || "/placeholder.svg?height=64&width=64"}
                    alt={bot.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Mobile header with icon */}
              <div className="flex items-center md:hidden mb-3">
                <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden mr-3">
                  <img
                    src={bot.icon || "/placeholder.svg?height=40&width=40"}
                    alt={bot.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center">
                  <h3 className="text-lg font-bold">{bot.name}</h3>
                  {bot.verified && (
                    <span className="ml-2 text-[#5865f2]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-badge-check"
                      >
                        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-grow">
                {/* Bot Name and Invite Button (desktop) */}
                <div className="hidden md:flex md:flex-row md:items-center justify-between mb-2">
                  <div className="flex items-center">
                    <h3 className="text-xl font-bold">{bot.name}</h3>
                    {bot.verified && (
                      <span className="ml-2 text-[#5865f2]">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-badge-check"
                        >
                          <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Button size="sm" className="bg-[#5865f2] hover:bg-[#4752c4] text-white">
                      邀請機器人
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 mb-4 line-clamp-2">{bot.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {bot.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-[#36393f] hover:bg-[#4f545c] text-gray-300">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
                  <div className="flex items-center">
                    <Users size={16} className="mr-1" />
                    <span>{bot.servers.toLocaleString()} 伺服器</span>
                  </div>
                  <div className="flex items-center">
                    <ArrowUp size={16} className="mr-1" />
                    <span>{bot.upvotes.toLocaleString()} 投票</span>
                  </div>
                  {bot.prefix && (
                    <div className="flex items-center">
                      <span className="font-mono bg-[#36393f] px-1.5 py-0.5 rounded text-xs">{bot.prefix}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    <span>
                      {formatDistanceToNow(new Date(bot.createdAt), {
                        addSuffix: true,
                        locale: zhTW,
                      })}
                    </span>
                  </div>
                </div>

                {/* Mobile Button */}
                <div className="mt-4 md:hidden">
                  <Button size="sm" className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white">
                    邀請機器人
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Bot Banner (desktop) */}
          {bot.banner && (
            <div className="hidden md:block w-48 h-auto bg-[#36393f] flex-shrink-0">
              <img
                src={bot.banner || "/placeholder.svg"}
                alt={`${bot.name} banner`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

