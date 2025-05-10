import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  Mail,
  Globe,
  Twitter,
  Github,
  MessageSquare,
  X,
} from 'lucide-react';

import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { SOCIAL_PLATFORMS } from '@/lib/socialPlatforms';
import { UserType } from '@/lib/get-user';
import { AvatarFallbackClient } from './AvatarFallbackClient';

interface UserHeaderProps {
  user: UserType;
}

export default function UserHeader({ user }: UserHeaderProps) {
  return (
    <div>
      {/* Banner */}
      <div className="h-90 bg-[#36393f] relative overflow-hidden">
        {user.banner ? (
          <div className="relative w-full h-full overflow-hidden">
            <div
              className="absolute inset-0 bg-center bg-cover blur-sm scale-110"
              style={{ backgroundImage: `url(${user.banner})` }}
            ></div>
          </div>
        ) : user.banner_color ? (
          <div
            className="w-full h-full"
            style={{ backgroundColor: user.banner_color }}
          ></div>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#5865f2] to-[#8c54ff]"></div>
        )}
      </div>

      {/* User Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-13 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
          <Avatar className="w-32 h-32 border-4 border-[#1e1f22] bg-[#36393f]">
            <AvatarImage
              src={user.avatar}
              alt={user.username}
              className="object-cover w-full h-full"
            />
            <AvatarFallback
              className="text-3xl bg-[#5865f2]"
              suppressHydrationWarning
            >
              <AvatarFallbackClient name={user.username} defaultChar="?" />
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {user.username}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-300 mt-2">
              <div className="flex items-center">
                <Calendar size={16} className="mr-1" />
                <span>
                  加入於{' '}
                  {formatDistanceToNow(new Date(user.joinedAt), {
                    addSuffix: true,
                    locale: zhTW,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="mt-6 bg-[#2b2d31] rounded-lg p-4">
            <p className="text-gray-300">{user.bio}</p>
          </div>
        )}

        {user.social && Object.entries(user.social).some(([, val]) => val) && (
          <div className="mt-6 flex flex-wrap gap-4">
            {Object.entries(user.social).map(([platform, value]) => {
              if (!value) return null;
              const config = SOCIAL_PLATFORMS[platform];
              if (!config) return null;

              const Icon = config.icon;
              const link = config.link ? config.link(value) : '#';

              return (
                <a
                  key={platform}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[#2b2d31] hover:bg-[#36393f] text-gray-300 hover:text-white rounded-md transition-colors"
                >
                  <Icon size={16} />
                  <span className="truncate max-w-[150px]">{value}</span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
