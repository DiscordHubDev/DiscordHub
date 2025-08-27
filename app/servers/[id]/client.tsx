'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, ArrowUp, Clock, Globe } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import Link from 'next/link';
import VoteButton from '@/components/vote-button';
import { PublicServer, ServerWithMinimalFavorited } from '@/lib/prisma_type';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FavoriteButton } from '@/components/favorite-button';
import { ReportDialog } from '@/components/ReportDialog';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { useEffect, useState } from 'react';
import { AvatarFallbackClient } from '@/components/AvatarFallbackClient';
import DOMPurify from 'isomorphic-dompurify';
import Image from 'next/image';

type ServerDetailPageProps = {
  allServers: PublicServer[];
  server: ServerWithMinimalFavorited;
  isFavorited: boolean;
};

export default function ServerDetailClientPage({
  server,
  allServers,
  isFavorited,
}: ServerDetailPageProps) {
  const handleInviteButtonClick = () => {
    window.open(server.inviteUrl!, '_blank', 'noopener,noreferrer');
  };

  const [voteCount, setVoteCount] = useState<number>(server.upvotes);

  const handleServerVoteClick = (newVoteCount: number) => {
    setVoteCount(newVoteCount);

    const cacheKey = `server_votes_${server.id}`;
    localStorage.setItem(cacheKey, newVoteCount.toString());
  };

  const getBannerUrl = (size = 1024) => {
    if (!server.banner) return null;
    return `${server.banner}?size=${size}&format=webp`;
  };

  useEffect(() => {
    const cacheKey = `server_votes_${server.id}`;
    const cachedVotes = localStorage.getItem(cacheKey);

    if (cachedVotes) {
      const votes = parseInt(cachedVotes, 10);
      if (votes > server.upvotes) {
        setVoteCount(votes);
      }
    }
  }, [server.id, server.upvotes]);

  return (
    <div className="min-h-screen bg-[#1e1f22] text-white">
      {/* Banner */}
      <div className="relative h-48 md:h-64 lg:h-80 bg-[#36393f] overflow-hidden">
        {server.banner ? (
          <div className="relative h-48 md:h-64 lg:h-80 bg-[#36393f] overflow-hidden">
            <Image
              src={getBannerUrl(1024) || ''}
              alt={`${server.name} banner`}
              fill
              priority
              quality={90}
              className="object-cover"
              sizes="(max-width: 768px) 768px, (max-width: 1200px) 1200px, 1920px"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSIzMDAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNDk0ZjU3O3N0b3Atb3BhY2l0eTowLjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iNTAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNzI4OWRhO3N0b3Atb3BhY2l0eTowLjA4IiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2MjY2ZWM7c3RvcC1vcGFjaXR5OjAuMSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8ZmlsdGVyIGlkPSJub2lzZSI+CiAgICAgIDxmZVR1cmJ1bGVuY2UgYmFzZUZyZXF1ZW5jeT0iMC4wMiIgc2VlZD0iMSIgLz4KICAgICAgPGZlQ29sb3JNYXRyaXggdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwLjA1IDAiIC8+CiAgICAgIDxmZUNvbXBvc2l0ZSBpbjI9IlNvdXJjZUdyYXBoaWMiIG9wZXJhdG9yPSJvdmVyIiAvPgogICAgPC9maWx0ZXI+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiIGZpbHRlcj0idXJsKCNub2lzZSkiIC8+CiAgPGNpcmNsZSBjeD0iMjAlIiBjeT0iMzAlIiByPSI0MCIgZmlsbD0iIzVlNjVmMiIgb3BhY2l0eT0iMC4wMyIvPgogIDxjaXJjbGUgY3g9Ijc1JSIgY3k9IjIwJSIgcj0iNjAiIGZpbGw9IiM4YzU0ZmYiIG9wYWNpdHk9IjAuMDQiLz4KICA8Y2lyY2xlIGN4PSI2MCUiIGN5PSI4MCUiIHI9IjUwIiBmaWxsPSIjNzI4OWRhIiBvcGFjaXR5PSIwLjAzIi8+Cjwvc3ZnPg=="
              unoptimized={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1e1f22]/60 to-transparent" />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#5865f2] to-[#8c54ff]" />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 伺服器圖標和基本資訊 */}
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 mt-3">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#36393f] border-4 border-[#1e1f22] overflow-hidden">
              <Avatar className="w-full h-full">
                <AvatarImage
                  src={server.icon || undefined}
                  alt={server.name}
                  className="object-cover w-full h-full"
                />
                <AvatarFallback
                  className="bg-[#36393f] text-white text-sm"
                  suppressHydrationWarning
                >
                  <AvatarFallbackClient name={server.name} />
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-col">
                <h1 className="lg:text-2xl md:text-1xl font-bold text-white">
                  {server.name}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-300 mt-2">
                <div className="flex items-center">
                  <Users size={16} className="mr-1" />
                  <span>{server.members.toLocaleString()} 成員</span>
                </div>
                <div className="flex items-center">
                  <ArrowUp size={16} className="mr-1" />
                  <span>{voteCount.toLocaleString()} 投票</span>
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
            </div>
          </div>

          {/* 加入伺服器按鈕 */}
        </div>

        {/* 加入伺服器按鈕 */}
        <div className="mt-6 mb-4 flex flex-wrap gap-x-4 gap-y-4">
          <Button
            size="lg"
            onClick={handleInviteButtonClick}
            className="w-full md:w-auto bg-[#5865f2] hover:bg-[#4752c4] text-white transition-all duration-150 transform hover:scale-105"
          >
            加入伺服器
          </Button>

          <ReportDialog
            itemId={server.id}
            itemName={server.name}
            type={'server'}
          />

          <FavoriteButton
            target="server"
            id={server.id}
            isFavorited={isFavorited}
          />
        </div>

        {/* 標籤 */}
        <div className="flex flex-wrap gap-2 mt-6">
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

        {/* 主要內容 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          {/* 側邊欄 */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="about" className="mb-8">
              <TabsList className="bg-[#2b2d31] border-b border-[#1e1f22] w-full h-full overflow-x-auto overflow-y-auto">
                <TabsTrigger
                  value="about"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  關於伺服器
                </TabsTrigger>
                <TabsTrigger
                  value="rules"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  規則
                </TabsTrigger>
                <TabsTrigger
                  value="screenshots"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  截圖
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-6">
                <div className="bg-[#2b2d31] rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">伺服器介紹</h2>
                  <MarkdownRenderer
                    content={DOMPurify.sanitize(server.longDescription || '')}
                  />

                  {server.features && server.features.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-3">伺服器特色</h3>
                      <ul className="space-y-2 text-gray-300">
                        {server.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-[#5865f2] mr-2">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="rules" className="mt-6">
                <div className="bg-[#2b2d31] rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">伺服器規則</h2>
                  {server.rules && server.rules.length > 0 ? (
                    <ol className="space-y-4 text-gray-300 list-decimal pl-5">
                      {server.rules.map((rule, index) => (
                        <li key={index} className="pl-2">
                          {rule}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-gray-400">此伺服器尚未提供規則。</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="screenshots" className="mt-6">
                <div className="bg-[#2b2d31] rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">伺服器截圖</h2>
                  {server.screenshots && server.screenshots.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {server.screenshots.map((screenshot, index) => (
                        <div
                          key={index}
                          className="rounded-lg overflow-hidden bg-[#36393f]"
                        >
                          <img
                            src={screenshot || '/placeholder.png'}
                            alt={`${server.name} screenshot ${index + 1}`}
                            className="w-full h-auto"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">此伺服器尚未提供截圖。</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-[#2b2d31] rounded-lg p-5 mb-6">
              <h3 className="text-lg font-semibold mb-4">伺服器資訊</h3>
              <div className="space-y-2">
                <span className="text-gray-400 w-20">擁有者:</span>
                {server.owner && (
                  <div className="flex items-center space-x-4 p-4 transition duration-200 rounded-lg hover:bg-white/10 transform group-hover:-translate-y-1">
                    <Link
                      href={`/users/${server.owner.id}`}
                      className="group flex items-center space-x-4"
                    >
                      <Avatar className="w-10 h-10 transition-transform duration-300 ease-in-out group-hover:scale-105">
                        <AvatarImage
                          src={server.owner.avatar}
                          alt={`${server.owner.username} avatar`}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-[#5865f2]">
                          {server.owner.username?.charAt(0).toUpperCase() ||
                            '?'}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-medium whitespace-nowrap transition-colors duration-200 text-gray-300">
                        {server.owner.username.length > 10
                          ? `${server.owner.username.slice(0, 10)}...`
                          : server.owner.username}
                      </p>
                    </Link>
                  </div>
                )}
                <div className="flex items-center">
                  <span className="text-gray-400 w-24">發布於:</span>
                  <span className="text-gray-300">
                    {new Date(server.createdAt).toLocaleDateString('zh-TW')}
                  </span>
                </div>
                {server.website && (
                  <div className="flex items-center">
                    <span className="text-gray-400 w-24">網站:</span>
                    <a
                      href={server.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#5865f2] hover:underline flex items-center"
                    >
                      <Globe size={14} className="mr-1" />
                      <span>訪問網站</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
            {/* 投票卡片 */}
            <div className="bg-[#2b2d31] rounded-lg p-5 mb-6">
              <h3 className="text-lg font-semibold mb-4">支持此伺服器</h3>
              <p className="text-gray-300 text-sm mb-4">
                喜歡這個伺服器嗎？投票支持它，幫助更多人發現這個伺服器！
              </p>
              <div className="bg-[#36393f] p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">當前票數</span>
                  <div className="flex items-center text-[#5865f2]">
                    <ArrowUp size={16} className="mr-1" />
                    <span className="font-bold">
                      {voteCount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <VoteButton
                id={server.id}
                type="server"
                initialVotes={voteCount}
                onVote={handleServerVoteClick}
                className="w-full bg-[#5865f2] hover:bg-[#4752c4]"
              />
              <p className="text-gray-400 text-xs mt-2 text-center">
                每 12 小時可投一次票
              </p>
            </div>
            <div className="bg-[#2b2d31] rounded-lg p-5">
              <h3 className="text-lg font-semibold mb-4">相關伺服器</h3>
              <div className="space-y-3">
                {allServers
                  .filter(
                    s =>
                      s.id !== server.id &&
                      s.tags.some(tag => server.tags.includes(tag)),
                  )
                  .slice(0, 3)
                  .map(relatedServer => (
                    <Link
                      key={relatedServer.id}
                      href={`/servers/${relatedServer.id}`}
                      className="flex items-center p-2 rounded hover:bg-[#36393f] transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden mr-3">
                        <img
                          src={
                            relatedServer.icon ||
                            '/placeholder.png?height=40&width=40'
                          }
                          alt={relatedServer.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{relatedServer.name}</div>
                        <div className="text-xs text-gray-400 flex items-center">
                          <Users size={12} className="mr-1" />
                          <span>
                            {relatedServer.members.toLocaleString()} 成員
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
