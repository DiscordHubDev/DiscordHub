'use client';

import { signIn, useSession } from 'next-auth/react';
import useSWR from 'swr';
import { useCallback, useMemo, useState, memo, useRef } from 'react';
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
  RefreshCw,
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
import PinButton from './pin-button';
import { toast } from 'react-toastify';

type ServerCardData = {
  id: string;
  name: string;
  icon: string | null;
  description: string;
  tags: string[];
  members: number;
  ownerId: string;
};

// 安全的 API Key 按鈕組件
const SecureAPIKeyButton = memo(({ isOwner }: { isOwner: boolean }) => {
  if (!isOwner) return null;

  return (
    <div className="mt-6 items-center">
      <div className="bg-[#2b2d31] rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">API 設置</h2>
        <div className="flex justify-center">
          <APIKeyManager />
        </div>
      </div>
    </div>
  );
});

SecureAPIKeyButton.displayName = 'SecureAPIKeyButton';

// 重構的 API Key 管理器 - 添加防重複請求機制
function APIKeyManager() {
  const { data: session } = useSession();
  const [apiKey, setApiKey] = useState<{
    accessToken: string;
    refreshToken: string;
  } | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 防重複請求的 ref
  const isRequestingRef = useRef(false);

  // 安全檢查：只有當前用戶才能管理自己的 API Key
  if (!session?.discordProfile?.id) {
    return <div className="text-gray-400">請先登入</div>;
  }

  const handleCreateOrRegen = useCallback(async () => {
    // 防重複請求檢查
    if (isRequestingRef.current || isLoading) {
      return;
    }

    isRequestingRef.current = true;
    setIsLoading(true);

    try {
      const response = await fetch('/api/apiKey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create API key');
      }

      const tokens = await response.json();
      setApiKey(tokens);

      // 安全地複製到剪貼簿
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(tokens.accessToken);
        // 使用更安全的通知方式
        showSuccessNotification('存取令牌已建立並複製到剪貼簿！');
      }

      setHasToken(true);
    } catch (error) {
      console.error('API Key creation failed:', error);
      showErrorNotification('操作失敗，請稍後再試');
    } finally {
      setIsLoading(false);
      // 延遲重置防重複請求標記
      setTimeout(() => {
        isRequestingRef.current = false;
      }, 1000);
    }
  }, [isLoading]);

  return (
    <div className="flex flex-col items-center mt-4 space-y-6 w-full">
      {apiKey && <TokenDisplaySection tokens={apiKey} />}

      <Button
        className="discord text-white cursor-pointer disabled:opacity-50"
        onClick={handleCreateOrRegen}
        disabled={isLoading || isRequestingRef.current}
      >
        {isLoading ? (
          <>載入中...</>
        ) : apiKey || hasToken ? (
          <>
            <RefreshCw size={16} className="mr-2" />
            重新建立 API Key
          </>
        ) : (
          <>
            <Plus size={16} className="mr-2" />
            建立 API Key
          </>
        )}
      </Button>
    </div>
  );
}

// 安全的令牌顯示組件
const TokenDisplaySection = memo(
  ({ tokens }: { tokens: { accessToken: string; refreshToken: string } }) => (
    <div className="space-y-4 w-full">
      <div className="text-yellow-200 rounded-md text-xl p-4 bg-yellow-900/20 border border-yellow-700">
        ⚠️ 此 API Key 僅會顯示一次，請妥善保存。離開或重新整理後將無法再次查看。
      </div>
      <SecureTokenDisplay label="存取令牌" token={tokens.accessToken} />
      <SecureTokenDisplay label="重整令牌" token={tokens.refreshToken} />
    </div>
  ),
);

TokenDisplaySection.displayName = 'TokenDisplaySection';

// 安全的令牌顯示組件 - 添加防重複複製機制
const SecureTokenDisplay = memo(
  ({ label, token }: { label: string; token: string }) => {
    const [copied, setCopied] = useState(false);
    const copyingRef = useRef(false);

    const handleCopy = useCallback(async () => {
      if (copyingRef.current) return;

      if (!navigator.clipboard || !window.isSecureContext) {
        showErrorNotification('無法複製：不支援剪貼簿功能');
        return;
      }

      copyingRef.current = true;

      try {
        await navigator.clipboard.writeText(token);
        setCopied(true);
        showSuccessNotification(`${label} 已複製成功！`);

        // 重置複製狀態
        setTimeout(() => {
          setCopied(false);
          copyingRef.current = false;
        }, 2000);
      } catch (error) {
        showErrorNotification('複製失敗');
        copyingRef.current = false;
      }
    }, [token, label]);

    return (
      <div>
        <p className="text-gray-200 mb-2">{label}：</p>
        <div
          className={`p-3 rounded-md font-mono text-sm break-all cursor-pointer transition-colors ${
            copied
              ? 'bg-green-800 text-green-100'
              : 'bg-gray-800 text-gray-100 hover:bg-gray-700'
          }`}
          onClick={handleCopy}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCopy();
            }
          }}
        >
          {copied ? '已複製！' : token}
        </div>
      </div>
    );
  },
);

SecureTokenDisplay.displayName = 'SecureTokenDisplay';

// 優化的伺服器標籤頁組件
const ServersTab = memo(
  ({
    managedServers,
    isOwner,
    onManageServer,
  }: {
    managedServers: ServerCardData[];
    isOwner: boolean;
    onManageServer: (id: string, e: React.MouseEvent) => void;
  }) => (
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
            <ServerCard
              key={server.id}
              server={server}
              isOwner={isOwner}
              onManageServer={onManageServer}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          message={`${isOwner ? '你' : '他'}尚未建立任何伺服器`}
          actionButton={
            isOwner ? (
              <Link href="/add-server">
                <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white">
                  <Plus size={16} />
                  新增伺服器
                </Button>
              </Link>
            ) : null
          }
        />
      )}
    </div>
  ),
);

ServersTab.displayName = 'ServersTab';

// 伺服器卡片組件 - 添加防重複點擊
const ServerCard = memo(
  ({
    server,
    isOwner,
    onManageServer,
  }: {
    server: ServerCardData;
    isOwner: boolean;
    onManageServer: (id: string, e: React.MouseEvent) => void;
  }) => {
    const clickingRef = useRef(false);

    const handleManageClick = useCallback(
      (e: React.MouseEvent) => {
        if (clickingRef.current) return;

        clickingRef.current = true;
        onManageServer(server.id, e);

        // 延遲重置點擊狀態
        setTimeout(() => {
          clickingRef.current = false;
        }, 1000);
      },
      [server.id, onManageServer],
    );

    return (
      <Card className="bg-[#2b2d31] border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200 flex flex-col h-full">
        <Link href={`/servers/${server.id}`} className="block">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden">
                <img
                  src={server.icon || '/placeholder.png?height=40&width=40'}
                  alt={server.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div>
                <CardTitle className="text-white truncate">
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
              {server.tags.slice(0, 3).map(tag => (
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
          <CardFooter className="mt-auto flex flex-col gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManageClick}
              className="w-full border-[#5865f2] text-white hover:bg-[#5865f2] hover:text-[#5865f2] cursor-pointer"
            >
              管理伺服器
            </Button>
            <PinButton
              variant="outline"
              id={server.id}
              type="server"
              className="w-full border-[#5865f2] text-white hover:bg-[#5865f2] hover:text-[#5865f2] cursor-pointer"
              itemName={server.name}
              ownerId={server.ownerId}
            />
          </CardFooter>
        )}
      </Card>
    );
  },
);

ServerCard.displayName = 'ServerCard';

// 機器人標籤頁組件
const BotsTab = memo(
  ({
    bots,
    isOwner,
    onManageBot,
  }: {
    bots: UserType['developedBots'];
    isOwner: boolean;
    onManageBot: (id: string, e: React.MouseEvent) => void;
  }) => {
    const approvedBots = useMemo(
      () => bots.filter(bot => bot.status !== 'rejected'),
      [bots],
    );

    return (
      <div className="mt-6">
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

        {approvedBots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedBots.map(bot => (
              <BotCard
                key={bot.id}
                bot={bot}
                isOwner={isOwner}
                onManageBot={onManageBot}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            message={`${isOwner ? '你' : '他'}尚未建立任何機器人`}
            actionButton={
              isOwner ? (
                <Link href="/add-bot">
                  <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white">
                    <Plus size={16} />
                    新增機器人
                  </Button>
                </Link>
              ) : null
            }
          />
        )}
      </div>
    );
  },
);

BotsTab.displayName = 'BotsTab';

// 機器人卡片組件 - 添加防重複點擊
const BotCard = memo(
  ({
    bot,
    isOwner,
    onManageBot,
  }: {
    bot: UserType['developedBots'][0];
    isOwner: boolean;
    onManageBot: (id: string, e: React.MouseEvent) => void;
  }) => {
    const clickingRef = useRef(false);

    const handleManageClick = useCallback(
      (e: React.MouseEvent) => {
        if (clickingRef.current) return;

        clickingRef.current = true;
        onManageBot(bot.id, e);

        // 延遲重置點擊狀態
        setTimeout(() => {
          clickingRef.current = false;
        }, 1000);
      },
      [bot.id, onManageBot],
    );

    return (
      <Card className="bg-[#2b2d31] border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200 flex flex-col h-full">
        <Link href={`/bots/${bot.id}`} className="block">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden">
                <img
                  src={bot.icon || '/placeholder.png?height=40&width=40'}
                  alt={bot.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-white truncate">
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
                      <TooltipContent>已驗證的 Discord 機器人</TooltipContent>
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
            <BotStatusIndicator status={bot.status} />
          </CardContent>
        </Link>

        {isOwner && (
          <CardFooter className="mt-auto flex flex-col gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManageClick}
              className="w-full border-[#5865f2] text-white hover:bg-[#5865f2] hover:text-[#5865f2] cursor-pointer"
            >
              管理機器人
            </Button>
            <PinButton
              variant="outline"
              id={bot.id}
              type="bot"
              className="w-full border-[#5865f2] text-white hover:bg-[#5865f2] hover:text-[#5865f2] cursor-pointer"
              itemName={bot.name}
              devs={bot.developers ? bot.developers.map(d => d.id) : []}
            />
          </CardFooter>
        )}
      </Card>
    );
  },
);

BotCard.displayName = 'BotCard';

// 機器人狀態指示器
const BotStatusIndicator = memo(({ status }: { status: string }) => {
  switch (status) {
    case 'pending':
      return (
        <div className="flex items-center text-sm text-yellow-500 mt-2">
          <Clock size={14} className="mr-1" />
          <span>機器人仍在審核中</span>
        </div>
      );
    case 'approved':
      return (
        <div className="flex items-center text-sm text-green-500 mt-2">
          <CheckCircle size={14} className="mr-1" />
          <span>機器人已通過審核</span>
        </div>
      );
    default:
      return null;
  }
});

BotStatusIndicator.displayName = 'BotStatusIndicator';

// 收藏標籤頁組件
const FavoritesTab = memo(
  ({
    favoriteServers,
    favoriteBots,
  }: {
    favoriteServers: UserType['favoriteServers'];
    favoriteBots: UserType['favoriteBots'];
  }) => (
    <div className="mt-6 space-y-8">
      <FavoriteServersSection servers={favoriteServers} />
      <FavoriteBotsSection bots={favoriteBots} />
    </div>
  ),
);

FavoritesTab.displayName = 'FavoritesTab';

// 收藏伺服器區塊
const FavoriteServersSection = memo(
  ({ servers }: { servers: UserType['favoriteServers'] }) => (
    <div>
      <h2 className="text-2xl font-bold mb-4">收藏的伺服器</h2>
      {servers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servers.map(server => (
            <FavoriteServerCard key={server.id} server={server} />
          ))}
        </div>
      ) : (
        <EmptyState message="沒有收藏的伺服器" />
      )}
    </div>
  ),
);

FavoriteServersSection.displayName = 'FavoriteServersSection';

// 收藏機器人區塊
const FavoriteBotsSection = memo(
  ({ bots }: { bots: UserType['favoriteBots'] }) => (
    <div>
      <h2 className="text-2xl font-bold mb-4">收藏的機器人</h2>
      {bots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bots.map(bot => (
            <FavoriteBotCard key={bot.id} bot={bot} />
          ))}
        </div>
      ) : (
        <EmptyState message="沒有收藏的機器人" />
      )}
    </div>
  ),
);

FavoriteBotsSection.displayName = 'FavoriteBotsSection';

// 收藏伺服器卡片
const FavoriteServerCard = memo(
  ({ server }: { server: UserType['favoriteServers'][0] }) => (
    <Link href={`/servers/${server.id}`} className="block">
      <Card className="bg-[#2b2d31] border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden">
              <img
                src={server.icon || '/placeholder.png?height=40&width=40'}
                alt={server.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div>
              <CardTitle className="text-white truncate">
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
  ),
);

FavoriteServerCard.displayName = 'FavoriteServerCard';

// 收藏機器人卡片
const FavoriteBotCard = memo(
  ({ bot }: { bot: UserType['favoriteBots'][0] }) => (
    <Link href={`/bots/${bot.id}`} className="block">
      <Card className="bg-[#2b2d31] border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden">
              <img
                src={bot.icon || '/placeholder.png?height=40&width=40'}
                alt={bot.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-white truncate">{bot.name}</CardTitle>
              {bot.verified && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className="discord text-white text-sm px-3 rounded-full gap-1 inline-flex items-center cursor-default hover:bg-[#5865F2] hover:text-white">
                        <FaCheck className="w-3.5 h-3.5" />
                        驗證
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>已驗證的 Discord 機器人</TooltipContent>
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
  ),
);

FavoriteBotCard.displayName = 'FavoriteBotCard';

// 設置標籤頁組件
const SettingsTab = memo(({ user }: { user: UserType }) => (
  <div className="mt-6">
    <div className="bg-[#2b2d31] rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">帳號設置</h2>
      <UserSettingsForm user={user} />
    </div>
  </div>
));

SettingsTab.displayName = 'SettingsTab';

// 空狀態組件
const EmptyState = memo(
  ({
    message,
    actionButton,
  }: {
    message: string;
    actionButton?: React.ReactNode;
  }) => (
    <div className="bg-[#2b2d31] rounded-lg p-8 text-center">
      <p className="text-gray-300 mb-4">{message}</p>
      {actionButton}
    </div>
  ),
);

EmptyState.displayName = 'EmptyState';

// 通知函數
function showSuccessNotification(message: string) {
  toast.success(message);
}

function showErrorNotification(message: string) {
  toast.error(message);
}

// 全局緩存管理 - 防止重複請求
const userProfileCache = new Map<
  string,
  { data: UserType; timestamp: number }
>();
const CACHE_DURATION = 10 * 60 * 1000; // 10分鐘緩存

// 優化的 fetcher，帶本地緩存
const createCachedFetcher = () => {
  return async ([_, userId]: [string, string]) => {
    if (!userId) throw new Error('No user ID provided');

    // 檢查本地緩存
    const cached = userProfileCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Using cached user data for:', userId);
      return cached.data;
    }

    console.log('Fetching fresh user data for:', userId);
    const user = await getCachedUser(userId);
    if (!user) throw new Error('User not found');

    // 存入緩存
    userProfileCache.set(userId, {
      data: user,
      timestamp: Date.now(),
    });

    return user;
  };
};

// 主組件 - 重構並優化
export default function UserProfile({ id }: { id?: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 安全檢查：確保只有在有效 session 的情況下才進行操作
  const currentUserId = session?.discordProfile?.id;
  const viewedUserId = id || currentUserId;
  const isOwner = currentUserId === viewedUserId;

  // 使用 useRef 來避免不必要的重新創建
  const stableViewedUserId = useRef(viewedUserId);
  const stableFetcher = useRef(createCachedFetcher());

  // 只在 userId 真正改變時更新
  if (stableViewedUserId.current !== viewedUserId) {
    stableViewedUserId.current = viewedUserId;
  }

  console.log('isOwner', isOwner);

  // 使用穩定的 fetcher reference
  const fetcher = stableFetcher.current;

  // 完全控制 SWR 的重新驗證，防止 Tab 切換時重新請求
  const {
    data: viewedUser,
    isLoading,
    error,
  } = useSWR(
    stableViewedUserId.current
      ? ['user-profile', stableViewedUserId.current]
      : null,
    fetcher,
    {
      // 完全禁用所有自動重新驗證
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      revalidateOnMount: true,

      // 防止重複請求的關鍵配置
      dedupingInterval: 600000, // 10分鐘內完全不重複請求
      refreshInterval: 0, // 禁用自動刷新
      errorRetryCount: 0, // 禁用重試
      shouldRetryOnError: false,

      // 關鍵：禁用背景重新驗證
      revalidateOnReconnectFocus: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,

      // 使用 immutable 模式，數據獲取後就不再變化
      revalidateWhenStale: false,

      // 自定義比較函數，確保數據穩定
      compare: (a, b) => {
        if (!a || !b) return a === b;
        return JSON.stringify(a) === JSON.stringify(b);
      },

      // 添加緩存配置
      keepPreviousData: true,
    },
  );

  // 使用 stable reference 來避免 managedServers 重複計算
  const managedServers = useMemo<ServerCardData[]>(() => {
    if (!viewedUser) return [];

    const serversMap = new Map<string, ServerCardData>();

    // 合併 ownedServers 和 adminIn，避免重複
    [...viewedUser.ownedServers, ...viewedUser.adminIn].forEach(s => {
      const serverId = String(s.id);
      if (!serversMap.has(serverId)) {
        serversMap.set(serverId, {
          id: serverId,
          name: s.name,
          icon: s.icon ?? null,
          description: s.description ?? '',
          tags: Array.isArray(s.tags) ? (s.tags as string[]) : [],
          members: Number(s.members ?? 0),
          ownerId: s.ownerId ?? '',
        });
      }
    });

    return Array.from(serversMap.values());
  }, [viewedUser?.ownedServers, viewedUser?.adminIn]);

  // 添加防重複點擊的 ref
  const navigationRef = useRef(false);

  const handleManageServer = useCallback(
    (serverId: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // 防重複導航
      if (navigationRef.current) return;

      navigationRef.current = true;
      router.push(`/profile/servers/${serverId}/edit`);

      // 延遲重置導航狀態
      setTimeout(() => {
        navigationRef.current = false;
      }, 2000);
    },
    [router],
  );

  const handleManageBot = useCallback(
    (botId: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // 防重複導航
      if (navigationRef.current) return;

      navigationRef.current = true;
      router.push(`/profile/bots/${botId}/edit`);

      // 延遲重置導航狀態
      setTimeout(() => {
        navigationRef.current = false;
      }, 2000);
    },
    [router],
  );

  // 早期返回處理 - 優化 session 檢查
  if (status === 'loading') {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#2b2d31] text-white">
        <div className="text-center animate-pulse">
          <h2 className="text-2xl font-semibold mb-2">載入中...</h2>
          <p className="text-gray-400 text-sm">正在驗證身份...</p>
        </div>
      </div>
    );
  }

  // 登入檢查 - 只在 session 明確無效時觸發登入
  if (
    status === 'unauthenticated' ||
    !session ||
    session?.error === 'RefreshAccessTokenError'
  ) {
    signIn('discord');
    return null;
  }

  // 載入中狀態
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

  // 錯誤狀態
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

  return (
    <div className="min-h-screen bg-[#1e1f22] text-white">
      <UserHeader user={viewedUser} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 使用受控的 Tabs，防止切換時重新渲染整個組件 */}
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

          {/* 使用 React.memo 包裝每個 TabsContent，防止不必要的重新渲染 */}
          <TabsContent value="servers" className="mt-6">
            <MemoizedServersTab
              managedServers={managedServers}
              isOwner={isOwner}
              onManageServer={handleManageServer}
            />
          </TabsContent>

          <TabsContent value="bots" className="mt-6">
            <MemoizedBotsTab
              bots={viewedUser.developedBots}
              isOwner={isOwner}
              onManageBot={handleManageBot}
            />
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <MemoizedFavoritesTab
              favoriteServers={viewedUser.favoriteServers}
              favoriteBots={viewedUser.favoriteBots}
            />
          </TabsContent>

          {isOwner && (
            <TabsContent value="settings" className="mt-6">
              <MemoizedSettingsContent isOwner={isOwner} user={viewedUser} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

// 創建記憶化的標籤頁組件，防止 Tab 切換時重新渲染
const MemoizedServersTab = memo(ServersTab);
const MemoizedBotsTab = memo(BotsTab);
const MemoizedFavoritesTab = memo(FavoritesTab);

// 記憶化的設置標籤頁組件
const MemoizedSettingsContent = memo(
  ({ isOwner, user }: { isOwner: boolean; user: UserType }) => (
    <>
      <SecureAPIKeyButton isOwner={isOwner} />
      <SettingsTab user={user} />
    </>
  ),
);
