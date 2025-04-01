import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Mail, Globe, Twitter, Github, MessageSquare } from "lucide-react"
import type { UserType } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { zhTW } from "date-fns/locale"

interface UserHeaderProps {
  user: UserType
}

export default function UserHeader({ user }: UserHeaderProps) {
  return (
    <div>
      {/* Banner */}
      <div className="h-48 bg-[#36393f] relative overflow-hidden">
        {user.banner ? (
          <img
            src={user.banner || "/placeholder.svg"}
            alt={`${user.username}'s banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#5865f2] to-[#8c54ff]"></div>
        )}
      </div>

      {/* User Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
          <Avatar className="w-32 h-32 border-4 border-[#1e1f22] bg-[#36393f]">
            <AvatarImage src={user.avatar} alt={user.username} />
            <AvatarFallback className="text-3xl bg-[#5865f2]">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{user.username}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-300 mt-2">
              <div className="flex items-center">
                <Calendar size={16} className="mr-1" />
                <span>
                  加入於{" "}
                  {formatDistanceToNow(new Date(user.joinedAt), {
                    addSuffix: true,
                    locale: zhTW,
                  })}
                </span>
              </div>
              <div className="flex items-center">
                <Mail size={16} className="mr-1" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 mt-4 md:mt-0 md:ml-auto">
            <Button size="sm" className="bg-[#5865f2] hover:bg-[#4752c4] text-white">
              編輯個人資料
            </Button>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="mt-6 bg-[#2b2d31] rounded-lg p-4">
            <p className="text-gray-300">{user.bio}</p>
          </div>
        )}

        {/* Social Links */}
        {user.social && Object.values(user.social).some((link) => link) && (
          <div className="mt-4 flex flex-wrap gap-3">
            {user.social.discord && (
              <a href="#" className="flex items-center text-gray-300 hover:text-white">
                <MessageSquare size={16} className="mr-1 text-[#5865f2]" />
                <span>{user.social.discord}</span>
              </a>
            )}
            {user.social.twitter && (
              <a href="#" className="flex items-center text-gray-300 hover:text-white">
                <Twitter size={16} className="mr-1 text-[#1DA1F2]" />
                <span>{user.social.twitter}</span>
              </a>
            )}
            {user.social.github && (
              <a href="#" className="flex items-center text-gray-300 hover:text-white">
                <Github size={16} className="mr-1" />
                <span>{user.social.github}</span>
              </a>
            )}
            {user.social.website && (
              <a href="#" className="flex items-center text-gray-300 hover:text-white">
                <Globe size={16} className="mr-1 text-[#5865f2]" />
                <span>{user.social.website}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

