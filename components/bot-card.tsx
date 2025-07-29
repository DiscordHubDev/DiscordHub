import { Users, ArrowUp, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FaCheck } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';
import { BotType } from '@/lib/prisma_type';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { useCallback, useMemo, memo } from 'react';

interface BotCardProps {
  bot: BotType;
}

// 抽取驗證徽章組件以減少重複代碼
const VerifiedBadge = memo(() => (
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
));

// 抽取管理員警告組件
const AdminWarning = memo(() => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="text-yellow-600 hover:text-yellow-500 cursor-pointer">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </TooltipTrigger>
      <TooltipContent className="bg-yellow-100 border border-yellow-400 text-yellow-900 max-w-sm px-3 py-2 rounded-md text-sm">
        <div className="flex flex-col space-y-1">
          <span>
            此機器人所需的權限包含 <strong>管理者權限</strong>
            ，可能會有潛在的安全疑慮，請謹慎邀請。
          </span>
          <span className="text-xs text-yellow-700">
            （僅為提醒用途，並非禁止邀請。請確認您信任此機器人開發者）
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
));

// 抽取標籤列表組件
const TagsList = memo(({ tags }: { tags: string[] }) => (
  <div className="flex flex-wrap gap-2 mb-4">
    {tags.map(tag => (
      <Badge
        key={tag}
        variant="secondary"
        className="bg-[#36393f] hover:bg-[#4f545c] text-gray-300"
      >
        {tag}
      </Badge>
    ))}
  </div>
));

// 抽取統計信息組件
const BotStats = memo(({ bot }: { bot: BotType }) => {
  const formattedTime = useMemo(() => {
    if (!bot.approvedAt) return '';
    return formatDistanceToNow(bot.approvedAt, {
      addSuffix: true,
      locale: zhTW,
    });
  }, [bot.approvedAt]);

  return (
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
          <span className="font-mono bg-[#36393f] px-1.5 py-0.5 rounded text-xs">
            {bot.prefix}
          </span>
        </div>
      )}
      {bot.approvedAt && (
        <div className="flex items-center">
          <Clock size={16} className="mr-1" />
          <span>{formattedTime}</span>
        </div>
      )}
    </div>
  );
});

// 主要組件
const BotCard = memo(({ bot }: BotCardProps) => {
  const handleInviteButtonClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (bot.inviteUrl) {
        window.open(bot.inviteUrl, '_blank', 'noopener,noreferrer');
      }
    },
    [bot.inviteUrl],
  );

  // 預計算顯示所需的值
  const iconSrc = bot.icon || '/placeholder.png';
  const bannerSrc = bot.banner || '/placeholder.png';
  const showBadges = bot.verified || bot.isAdmin;

  return (
    <Link href={`/bots/${bot.id}`} className="block">
      <div className="bg-[#2b2d31] rounded-lg overflow-hidden border border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200">
        <div className="flex flex-col md:flex-row">
          {/* Bot Banner (mobile) */}
          {bot.banner && (
            <div className="w-full h-32 md:hidden relative">
              <Image
                src={bannerSrc}
                alt={`${bot.name} banner`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 0px"
                priority={false}
              />
            </div>
          )}

          <div className="flex-grow p-4 md:p-5">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Bot Icon (desktop) */}
              <div className="hidden md:block flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-[#36393f] overflow-hidden relative">
                  <Image
                    src={iconSrc}
                    alt={bot.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                    priority={false}
                  />
                </div>
              </div>

              {/* Mobile header with icon */}
              <div className="flex items-center md:hidden mb-3">
                <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden mr-3 relative">
                  <Image
                    src={iconSrc}
                    alt={bot.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                    priority={false}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{bot.name}</h3>
                  {showBadges && (
                    <>
                      {bot.verified && <VerifiedBadge />}
                      {bot.isAdmin && <AdminWarning />}
                    </>
                  )}
                </div>
              </div>

              <div className="flex-grow">
                {/* Bot Name and Invite Button (desktop) */}
                <div className="hidden md:flex md:flex-row md:items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold">{bot.name}</h3>
                    {showBadges && (
                      <>
                        {bot.verified && <VerifiedBadge />}
                        {bot.isAdmin && <AdminWarning />}
                      </>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Button
                      size="sm"
                      onClick={handleInviteButtonClick}
                      className="bg-[#5865f2] hover:bg-[#4752c4] text-white"
                    >
                      邀請機器人
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 mb-4 line-clamp-2">
                  {bot.description}
                </p>

                {/* Tags */}
                {bot.tags.length > 0 && <TagsList tags={bot.tags} />}

                {/* Stats */}
                <BotStats bot={bot} />

                {/* Mobile Button */}
                <div className="mt-4 md:hidden">
                  <Button
                    size="sm"
                    className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white"
                    onClick={handleInviteButtonClick}
                  >
                    邀請機器人
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

BotCard.displayName = 'BotCard';
VerifiedBadge.displayName = 'VerifiedBadge';
AdminWarning.displayName = 'AdminWarning';
TagsList.displayName = 'TagsList';
BotStats.displayName = 'BotStats';

export default BotCard;
