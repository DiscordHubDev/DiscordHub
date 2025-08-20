import { Users, ArrowUp, Clock, Pin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';
import { PublicServer } from '@/lib/prisma_type';
import clsx from 'clsx';
import { memo, useCallback, useMemo, useState } from 'react';
import { AvatarFallback } from '@radix-ui/react-avatar';
import { Avatar } from './ui/avatar';
import DOMPurify from 'isomorphic-dompurify';

interface ServerCardProps {
  server: PublicServer;
}

const ServerCard = memo(function ServerCard({ server }: ServerCardProps) {
  // 使用 useMemo 緩存格式化的時間字串
  const formattedTime = useMemo(() => {
    return formatDistanceToNow(new Date(server.createdAt), {
      addSuffix: true,
      locale: zhTW,
    });
  }, [server.createdAt]);

  // 使用 useMemo 緩存格式化的數字
  const formattedNumbers = useMemo(
    () => ({
      members: server.members.toLocaleString(),
      upvotes: server.upvotes.toLocaleString(),
      online: server.online?.toLocaleString(),
    }),
    [server.members, server.upvotes, server.online],
  );

  // 使用 useCallback 優化點擊處理函數
  const handleJoinClick = useCallback(
    (e: React.MouseEvent) => {
      if (server.inviteUrl) {
        window.open(server.inviteUrl, '_blank', 'noopener,noreferrer');
      }
      e.preventDefault();
    },
    [server.inviteUrl],
  );

  // 使用 useMemo 緩存動態樣式類
  const cardClassName = clsx(
    'rounded-lg overflow-hidden transition-all duration-300',
    'bg-[#2b2d31]',
    'border border-[#1e1f22] hover:border-[#5865f2]',
  );

  // 緩存標籤列表
  const tagsList = useMemo(
    () => (
      <div className="flex flex-wrap gap-2 mb-4">
        {server.tags.map(tag => (
          <Badge
            key={tag}
            variant="secondary"
            className="bg-[#36393f] hover:bg-[#4f545c] text-gray-300"
          >
            {tag}
          </Badge>
        ))}
      </div>
    ),
    [server.tags],
  );

  const [bannerError, setBannerError] = useState(false);

  return (
    <Link href={`/servers/${server.id}`} className="block">
      <div className={cardClassName}>
        <div className="flex flex-col md:flex-row">
          {/* Server Banner (mobile) - 使用 Next.js Image 組件 */}
          {server.banner && !bannerError && (
            <div className="w-full h-32 md:hidden relative">
              <Image
                src={server.banner}
                alt={`${server.name} banner`}
                fill
                className="object-cover"
                priority={server.pin}
                sizes="(max-width: 768px) 100vw, 0px"
                onError={() => setBannerError(true)}
              />
            </div>
          )}

          <div className="flex-grow p-4 md:p-5">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Server Icon (desktop) - 使用 Next.js Image 組件 */}
              <div className="hidden md:block flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-[#36393f] overflow-hidden relative">
                  <Avatar className="w-16 h-16">
                    {server.icon ? (
                      <Image
                        src={server.icon}
                        alt={server.name}
                        width={64}
                        height={64}
                        className="object-cover"
                        priority={server.pin} // 合作伺服器優先載入
                      />
                    ) : (
                      <AvatarFallback>
                        {server.name?.charAt(0).toUpperCase() ?? '?'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
              </div>

              {/* Mobile header with icon - 使用 Next.js Image 組件 */}
              <div className="flex items-center md:hidden">
                <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden mr-3 relative">
                  <Avatar className="w-10 h-10">
                    {server.icon ? (
                      <Image
                        src={server.icon}
                        alt={server.name}
                        width={40}
                        height={40}
                        className="object-cover"
                        priority={server.pin} // 合作伺服器優先載入
                      />
                    ) : (
                      <AvatarFallback>
                        {server.name?.charAt(0).toUpperCase() ?? '?'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>

                <div className="flex flex-col">
                  <h3 className="text-lg font-bold flex items-center">
                    {server.name}
                    {server.pin && (
                      <Pin size={16} className="ml-2 text-gray-400" />
                    )}
                  </h3>
                </div>
              </div>

              <div className="flex-grow">
                {/* Server Name and Join Button (desktop) */}
                <div className="hidden md:flex md:flex-row md:items-center justify-between mb-2">
                  <div className="flex flex-row space-x-3">
                    <h3 className="text-xl font-bold flex items-center">
                      {server.name}
                      {server.pin && (
                        <Pin size={18} className="ml-2 text-gray-400" />
                      )}
                    </h3>
                  </div>
                  <div className="flex items-center">
                    <Button
                      size="sm"
                      className="bg-[#5865f2] hover:bg-[#4752c4] text-white cursor-pointer"
                      onClick={handleJoinClick}
                    >
                      加入伺服器
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <p
                  className="text-gray-300 mb-4 line-clamp-2"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(server.description),
                  }}
                />

                {/* Tags - 使用緩存的標籤列表 */}
                {tagsList}

                {/* Stats - 使用緩存的格式化數字 */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
                  <div className="flex items-center">
                    <Users size={16} className="mr-1" />
                    <span>{formattedNumbers.members} 成員</span>
                  </div>
                  <div className="flex items-center">
                    <ArrowUp size={16} className="mr-1" />
                    <span>{formattedNumbers.upvotes} 投票</span>
                  </div>
                  {server.online && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                      <span>{formattedNumbers.online} 在線</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    <span>{formattedTime}</span>
                  </div>
                </div>

                {/* Join Button (mobile) */}
                <div className="mt-4 md:hidden">
                  <Button
                    size="sm"
                    className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white cursor-pointer"
                    onClick={handleJoinClick}
                  >
                    加入伺服器
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

export default ServerCard;
