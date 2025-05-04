'use client';

import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Bot,
  Star,
  Settings,
  Plus,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { getUserById } from '@/lib/actions/user';
import UserSettingsForm from './form/user-form/SettingsForm';
import UserHeader from './user-header';
import { UserType } from '@/lib/prisma_type';
import { notFound, redirect, useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { FaCheck } from 'react-icons/fa6';

export default function UserProfile({ id }: { id?: string }) {
  const { data: session } = useSession();

  if (!session || session?.error === 'RefreshAccessTokenError') {
    signIn('discord');
    return;
  }

  const [viewedUser, setViewedUser] = useState<UserType>();

  const isOwner = !id || session?.discordProfile?.id === id;

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const user = id
        ? await getUserById(id)
        : await getUserById(session?.discordProfile?.id!);

      if (!user) {
        return notFound();
      }

      setViewedUser(user || undefined);
    };
    if (session) fetchUser();
  }, [id, session]);

  if (!viewedUser) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#2b2d31] text-white">
        <div className="text-center animate-pulse">
          <h2 className="text-2xl font-semibold mb-2">載入中...</h2>
          <p className="text-gray-400 text-sm">正在準備用戶資料...</p>
        </div>
      </div>
    );
  }

  const managedServersMap = new Map<
    string,
    (typeof viewedUser.ownedServers)[number]
  >();

  [...viewedUser.ownedServers, ...viewedUser.adminIn].forEach(server => {
    const serverId = String(server.id);
    if (!managedServersMap.has(serverId)) {
      managedServersMap.set(serverId, server);
    }
  });

  const managedServers = Array.from(managedServersMap.values());

  return (
    <div className="min-h-screen bg-[#1e1f22] text-white">
      {/* 使用者標頭 */}
      <UserHeader user={viewedUser} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="servers" className="mb-8">
          <TabsList className="bg-[#2b2d31] border-b border-[#1e1f22] w-full h-full overflow-x-auto overflow-y-auto">
            <TabsTrigger
              value="servers"
              className="data-[state=active]:bg-[#36393f]"
            >
              <Users size={16} className="mr-2" />
              {isOwner ? '我' : '他'}的伺服器
            </TabsTrigger>
            <TabsTrigger
              value="bots"
              className="data-[state=active]:bg-[#36393f]"
            >
              <Bot size={16} className="mr-2" />
              {isOwner ? '我' : '他'}的機器人
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="data-[state=active]:bg-[#36393f]"
            >
              <Star size={16} className="mr-2" />
              {isOwner ? '我' : '他'}的收藏
            </TabsTrigger>
            {isOwner && (
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-[#36393f]"
              >
                <Settings size={16} className="mr-2" />
                帳號設置
              </TabsTrigger>
            )}
          </TabsList>

          {/* 我的伺服器 */}
          <TabsContent value="servers" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {isOwner ? '我' : '他'}的伺服器
              </h2>
              {isOwner && (
                <Link href="/add-server">
                  <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white">
                    <Plus size={16} />
                    新增伺服器
                  </Button>
                </Link>
              )}
            </div>

            {managedServers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {managedServers.map(server => (
                  <Link
                    href={`/servers/${server.id}`}
                    key={server.id}
                    className="block"
                  >
                    <Card className="bg-[#2b2d31] border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200">
                      <CardHeader className="pb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden">
                            <img
                              src={
                                server.icon ||
                                '/placeholder.svg?height=40&width=40'
                              }
                              alt={server.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <CardTitle className="text-white">
                              {server.name}
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                              {server.members.toLocaleString()} 成員
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-gray-300 text-sm line-clamp-2">
                          {server.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(server.tags.slice(0, 3) as string[]).map(
                            (tag: string) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="bg-[#36393f] text-gray-300 text-xs"
                              >
                                {tag}
                              </Badge>
                            ),
                          )}
                        </div>
                      </CardContent>
                      {isOwner && (
                        <CardFooter>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={e => {
                              e.preventDefault();
                              router.push(`/profile/servers/${server.id}/edit`);
                            }}
                            className="w-full border-[#5865f2] text-white hover:bg-[#5865f2] hover:text-[#5865f2]"
                          >
                            管理伺服器
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-[#2b2d31] rounded-lg p-8 text-center">
                <p className="text-gray-300 mb-4">
                  {isOwner ? '你' : '他'}尚未建立任何伺服器
                </p>
                {isOwner && (
                  <Link href="/add-server">
                    <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white">
                      <Plus size={16} />
                      新增伺服器
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </TabsContent>

          {/* 我的機器人 */}
          <TabsContent value="bots" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {isOwner ? '我' : '他'}的機器人
              </h2>
              {isOwner && (
                <Link href="/add-bot">
                  <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white">
                    <Plus size={16} />
                    新增機器人
                  </Button>
                </Link>
              )}
            </div>

            {viewedUser.developedBots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {viewedUser.developedBots.map(bot => (
                  <Link href={`/bots/${bot.id}`} key={bot.id} className="block">
                    <Card className="bg-[#2b2d31] border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200">
                      <CardHeader className="pb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden">
                            <img
                              src={
                                bot.icon ||
                                '/placeholder.svg?height=40&width=40'
                              }
                              alt={bot.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-white">
                              {bot.name}
                            </CardTitle>
                            {bot.verified && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge className="discord text-white text-sm px-3 rounded-full gap-1 inline-flex items-center cursor-default hover:bg-[#5865F2] hover:text-white">
                                      <FaCheck className="w-3.5 h-3.5" />
                                      驗證
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    已驗證的 Discord 機器人
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-gray-300 text-sm line-clamp-2">
                          {bot.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {bot.tags.slice(0, 3).map(tag => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-[#36393f] text-gray-300 text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center text-sm text-gray-400 mt-2">
                          <Users size={14} className="mr-1" />
                          <span>{bot.servers.toLocaleString()} 伺服器</span>
                        </div>
                        {bot.status === 'pending' && (
                          <div className="flex items-center text-sm text-yellow-500 mt-2">
                            <Clock size={14} className="mr-1" />
                            <span>機器人仍在審核中</span>
                          </div>
                        )}

                        {bot.status === 'approved' && (
                          <div className="flex items-center text-sm text-green-500 mt-2">
                            <CheckCircle size={14} className="mr-1" />
                            <span>機器人已通過審核</span>
                          </div>
                        )}
                      </CardContent>
                      {isOwner && (
                        <CardFooter>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={e => {
                              e.preventDefault();
                              router.push(`/profile/bots/${bot.id}/edit`);
                            }}
                            className="w-full border-[#5865f2] text-white hover:bg-[#5865f2] hover:text-[#5865f2]"
                          >
                            管理機器人
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-[#2b2d31] rounded-lg p-8 text-center">
                <p className="text-gray-300 mb-4">
                  {isOwner ? '你' : '他'}尚未建立任何機器人
                </p>
                {isOwner && (
                  <Link href="/add-bot">
                    <Button className="bg-[#5865f2] hover:bg-[#4752c4]">
                      <Plus size={16} className="mr-2" />
                      新增機器人
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </TabsContent>

          {/* 我的收藏 */}
          <TabsContent value="favorites" className="mt-6">
            <div className="space-y-8">
              {/* 收藏的伺服器 */}
              <div>
                <h2 className="text-2xl font-bold mb-4">收藏的伺服器</h2>
                {viewedUser.favoriteServers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {viewedUser.favoriteServers.map(server => (
                      <Link
                        href={`/servers/${server.id}`}
                        key={server.id}
                        className="block"
                      >
                        <Card className="bg-[#2b2d31] border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200">
                          <CardHeader className="pb-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden">
                                <img
                                  src={
                                    server.icon ||
                                    '/placeholder.svg?height=40&width=40'
                                  }
                                  alt={server.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <CardTitle className="text-white">
                                  {server.name}
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                  {server.members.toLocaleString()} 成員
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-300 text-sm line-clamp-2">
                              {server.description}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#2b2d31] rounded-lg p-6 text-center">
                    <p className="text-gray-300">沒有收藏的伺服器</p>
                  </div>
                )}
              </div>

              {/* 收藏的機器人 */}
              <div>
                <h2 className="text-2xl font-bold mb-4">收藏的機器人</h2>
                {viewedUser.favoriteBots.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {viewedUser.favoriteBots.map(bot => (
                      <Link
                        href={`/bots/${bot.id}`}
                        key={bot.id}
                        className="block"
                      >
                        <Card className="bg-[#2b2d31] border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200">
                          <CardHeader className="pb-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden">
                                <img
                                  src={
                                    bot.icon ||
                                    '/placeholder.svg?height=40&width=40'
                                  }
                                  alt={bot.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-white">
                                  {bot.name}
                                </CardTitle>
                                {bot.verified && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge className="discord text-white text-sm px-3 rounded-full gap-1 inline-flex items-center cursor-default hover:bg-[#5865F2] hover:text-white">
                                          <FaCheck className="w-3.5 h-3.5" />
                                          驗證
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        已驗證的 Discord 機器人
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-300 text-sm line-clamp-2">
                              {bot.description}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#2b2d31] rounded-lg p-6 text-center">
                    <p className="text-gray-300">沒有收藏的機器人</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* 帳號設置 */}
          {isOwner && (
            <TabsContent value="settings" className="mt-6">
              <div className="bg-[#2b2d31] rounded-lg p-6">
                <h2 className="text-xl font-bold mb-6">帳號設置</h2>
                <UserSettingsForm user={viewedUser} />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
