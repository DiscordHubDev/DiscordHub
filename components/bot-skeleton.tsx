import { Skeleton } from '@/components/ui/skeleton';
import { memo } from 'react';

// 抽取標籤 skeleton
const TagsSkeleton = memo(() => (
  <div className="flex flex-wrap gap-2 mb-4">
    {[...Array(3)].map((_, i) => (
      <Skeleton key={i} className="h-6 w-16 rounded bg-[#36393f]" />
    ))}
  </div>
));

// 抽取統計信息 skeleton
const BotStatsSkeleton = memo(() => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
    <div className="flex items-center gap-1">
      <Skeleton className="w-4 h-4 rounded-full bg-[#36393f]" />
      <Skeleton className="w-16 h-4 rounded bg-[#36393f]" />
    </div>
    <div className="flex items-center gap-1">
      <Skeleton className="w-4 h-4 rounded-full bg-[#36393f]" />
      <Skeleton className="w-16 h-4 rounded bg-[#36393f]" />
    </div>
    <div className="flex items-center gap-1">
      <Skeleton className="w-10 h-4 rounded bg-[#36393f]" />
    </div>
    <div className="flex items-center gap-1">
      <Skeleton className="w-4 h-4 rounded-full bg-[#36393f]" />
      <Skeleton className="w-20 h-4 rounded bg-[#36393f]" />
    </div>
  </div>
));

// Card Skeleton 主組件
const BotCardSkeleton = memo(() => (
  <div className="bg-[#2b2d31] rounded-lg overflow-hidden border border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200">
    <div className="flex flex-col md:flex-row">
      {/* Bot Banner (mobile) */}
      <div className="w-full h-32 md:hidden relative">
        <Skeleton className="w-full h-full absolute top-0 left-0 rounded-none bg-[#36393f]" />
      </div>
      <div className="flex-grow p-4 md:p-5">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Bot Icon (desktop) */}
          <div className="hidden md:block flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-[#36393f] overflow-hidden relative">
              <Skeleton className="w-full h-full rounded-full bg-[#4f545c]" />
            </div>
          </div>
          {/* Mobile header with icon */}
          <div className="flex items-center md:hidden mb-3">
            <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden mr-3 relative">
              <Skeleton className="w-full h-full rounded-full bg-[#4f545c]" />
            </div>
          </div>
          <div className="flex-grow">
            {/* Bot Name and Invite Button (desktop) */}
            <div className="hidden md:flex md:flex-row md:items-center justify-between mb-2"></div>
            {/* Description */}
            <Skeleton className="h-4 w-full mb-2 rounded bg-[#36393f]" />
            <Skeleton className="h-4 w-2/3 mb-4 rounded bg-[#36393f]" />
            {/* Tags */}
            <TagsSkeleton />
            {/* Stats */}
            <BotStatsSkeleton />
            {/* Mobile Button */}
          </div>
        </div>
      </div>
    </div>
  </div>
));

BotCardSkeleton.displayName = 'BotCardSkeleton';
TagsSkeleton.displayName = 'TagsSkeleton';
BotStatsSkeleton.displayName = 'BotStatsSkeleton';

export function BotListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, index) => (
        <BotCardSkeleton key={index} />
      ))}
    </div>
  );
}
