import type { BotType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import Link from "next/link";
import { BotWithRelations } from "@/lib/prisma_type";

interface FeaturedBotsProps {
  bots: BotWithRelations[];
}

export default function FeaturedBots({ bots }: FeaturedBotsProps) {
  // Only show up to 3 featured bots
  const featuredBots = bots.slice(0, 3);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">精選機器人</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {featuredBots.map((bot) => (
          <Link href={`/bots/${bot.id}`} key={bot.id} className="block">
            <div className="bg-[#2b2d31] rounded-lg overflow-hidden border border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200 flex flex-col h-full">
              {/* Banner */}
              <div className="h-32 bg-[#36393f] relative">
                {bot.banner ? (
                  <div className="relative w-full h-48 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-center bg-cover blur-sm scale-110"
                      style={{ backgroundColor: bot.banner }}
                    ></div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-[#5865f2] to-[#8c54ff]"></div>
                )}
                {/* Bot Icon */}
                <div className="absolute -bottom-6 left-4 w-12 h-12 rounded-full bg-[#36393f] border-4 border-[#2b2d31] overflow-hidden">
                  <img
                    src={bot.icon || "/placeholder.svg?height=48&width=48"}
                    alt={bot.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="p-4 pt-8 flex-grow">
                <div className="flex items-center mb-2">
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
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                  {bot.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {bot.tags.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-[#36393f] hover:bg-[#4f545c] text-gray-300 text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {bot.tags.length > 3 && (
                    <Badge
                      variant="secondary"
                      className="bg-[#36393f] text-gray-300 text-xs"
                    >
                      +{bot.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center text-sm text-gray-400 mb-4">
                  <Users size={14} className="mr-1" />
                  <span>{bot.servers.toLocaleString()} 伺服器</span>
                  {bot.prefix && (
                    <>
                      <div className="mx-2">•</div>
                      <div className="flex items-center">
                        <span className="font-mono bg-[#36393f] px-1.5 py-0.5 rounded text-xs">
                          {bot.prefix}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0 mt-auto">
                <Button
                  size="sm"
                  className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white"
                >
                  邀請機器人
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
