'use client';

import { signIn, useSession } from 'next-auth/react';
import useSWR from 'swr';
import { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import UserSettingsForm from './form/user-form/SettingsForm';
import UserHeader from './user-header';
import { UserType } from '@/lib/prisma_type';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { FaCheck } from 'react-icons/fa6';
import { getCachedUser } from '@/lib/actions/user';

type ServerCardData = {
  id: string;
  name: string;
  icon: string | null;
  description: string;
  tags: string[];
  members: number;
};

/* -------------------- 子元件：Servers -------------------- */
function ServersTab({
  managedServers,
  isOwner,
  onManageServer,
}: {
  managedServers: ServerCardData[];
  isOwner: boolean;
  onManageServer: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{isOwner ? '我' : '他'}的伺服器</h2>
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
            <Card
              key={server.id}
              className="bg-[#2b2d31] border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200"
            >
              <Link href={`/servers/${server.id}`} className="block">
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden">
                      <img
                        src={
                          server.icon || '/placeholder.png?height=40&width=40'
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
                    {(server.tags.slice(0, 3) as string[]).map(tag => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-[#36393f] text-gray-300 text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Link>

              {isOwner && (
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={e => onManageServer(server.id, e)}
                    className="w-full border-[#5865f2] text-white hover:bg-[#5865f2] hover:text-[#5865f2] cursor-pointer"
                  >
                    管理伺服器
                  </Button>
                </CardFooter>
              )}
            </Card>
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
    </div>
  );
}

/* -------------------- 子元件：Bots -------------------- */
function BotsTab({
  bots,
  isOwner,
  onManageBot,
}: {
  bots: UserType['developedBots'];
  isOwner: boolean;
  onManageBot: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{isOwner ? '我' : '他'}的機器人</h2>
        {isOwner && (
          <Link href="/add-bot">
            <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white">
              <Plus size={16} />
              新增機器人
            </Button>
          </Link>
        )}
      </div>

      {bots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bots
            .filter(bot => bot.status !== 'rejected')
            .map(bot => (
              <Card
                className="bg-[#2b2d31] border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200"
                key={bot.id}
              >
                <Link href={`/bots/${bot.id}`} className="block">
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden">
                        <img
                          src={
                            bot.icon || '/placeholder.png?height=40&width=40'
                          }
                          alt={bot.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-white">{bot.name}</CardTitle>
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
                </Link>

                {isOwner && (
                  <CardFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={e => onManageBot(bot.id, e)}
                      className="w-full border-[#5865f2] text-white hover:bg-[#5865f2] hover:text-[#5865f2] cursor-pointer"
                    >
                      管理機器人
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
        </div>
      ) : (
        <div className="bg-[#2b2d31] rounded-lg p-8 text-center">
          <p className="text-gray-300 mb-4">
            {isOwner ? '你' : '他'}尚未建立任何機器人
          </p>
          {isOwner && (
            <Link href="/add-bot">
              <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white">
                <Plus size={16} />
                新增機器人
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------- 子元件：Favorites -------------------- */
function FavoritesTab({
  favoriteServers,
  favoriteBots,
}: {
  favoriteServers: UserType['favoriteServers'];
  favoriteBots: UserType['favoriteBots'];
}) {
  return (
    <div className="mt-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">收藏的伺服器</h2>
        {favoriteServers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteServers.map(server => (
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
                            server.icon || '/placeholder.png?height=40&width=40'
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

      <div>
        <h2 className="text-2xl font-bold mb-4">收藏的機器人</h2>
        {favoriteBots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteBots.map(bot => (
              <Link href={`/bots/${bot.id}`} key={bot.id} className="block">
                <Card className="bg-[#2b2d31] border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden">
                        <img
                          src={
                            bot.icon || '/placeholder.png?height=40&width=40'
                          }
                          alt={bot.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-white">{bot.name}</CardTitle>
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
  );
}

/* -------------------- 子元件：Settings -------------------- */
function SettingsTab({ user }: { user: UserType }) {
  return (
    <div className="mt-6">
      <div className="bg-[#2b2d31] rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">帳號設置</h2>
        <UserSettingsForm user={user} />
      </div>
    </div>
  );
}

/* ==================== 父元件 ==================== */
export default function UserProfile({ id }: { id?: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const userId = id || session?.discordProfile?.id;

  const fetcher = async ([_, id]: [string, string]) => {
    const user = await getCachedUser(id);
    if (!user) throw new Error('Not found');
    return user;
  };

  const {
    data: viewedUser,
    isLoading,
    error,
  } = useSWR<UserType>(userId ? ['user-profile', userId] : null, fetcher, {
    dedupingInterval: 60000,
    revalidateOnFocus: false,
  });

  const isOwner = !id || session?.discordProfile?.id === id;

  const managedServers = useMemo<ServerCardData[]>(
    () =>
      viewedUser
        ? Array.from(
            new Map(
              [...viewedUser.ownedServers, ...viewedUser.adminIn].map(s => [
                String(s.id),
                {
                  id: String(s.id),
                  name: s.name,
                  icon: s.icon ?? null,
                  description: s.description ?? '',
                  tags: Array.isArray(s.tags) ? (s.tags as string[]) : [],
                  members: Number(s.members ?? 0),
                } satisfies ServerCardData,
              ]),
            ).values(),
          )
        : [],
    [viewedUser],
  );

  // 事件 handler（安全，且在任何 early return 之前宣告）
  const handleManageServer = useCallback(
    (serverId: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      router.push(`/profile/servers/${serverId}/edit`);
    },
    [router],
  );

  const handleManageBot = useCallback(
    (botId: string, e: React.MouseEvent) => {
      e.preventDefault();
      router.push(`/profile/bots/${botId}/edit`);
    },
    [router],
  );

  // 登入判斷（可能 early return）
  if (!session || session?.error === 'RefreshAccessTokenError') {
    signIn('discord');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#2b2d31] text-white">
        <div className="text-center animate-pulse">
          <h2 className="text-2xl font-semibold mb-2">載入中...</h2>
          <p className="text-gray-400 text-sm">正在準備用戶資料...</p>
        </div>
      </div>
    );
  }

  if (error || !viewedUser) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#2b2d31] text-white">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">找不到用戶</h2>
          <p className="text-gray-400 text-sm">用戶資料不存在或已被移除。</p>
        </div>
      </div>
    );
  }

  // ✅ 不再有 renderXxxTab 的 useCallback；以子元件 + TabsContent 呈現
  return (
    <div className="min-h-screen bg-[#1e1f22] text-white">
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

          <TabsContent value="servers" className="mt-6">
            <ServersTab
              managedServers={managedServers}
              isOwner={isOwner}
              onManageServer={handleManageServer}
            />
          </TabsContent>

          <TabsContent value="bots" className="mt-6">
            <BotsTab
              bots={viewedUser.developedBots}
              isOwner={isOwner}
              onManageBot={handleManageBot}
            />
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <FavoritesTab
              favoriteServers={viewedUser.favoriteServers}
              favoriteBots={viewedUser.favoriteBots}
            />
          </TabsContent>

          {isOwner && (
            <TabsContent value="settings" className="mt-6">
              <SettingsTab user={viewedUser} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
