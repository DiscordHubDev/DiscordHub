import { PublicServer } from '@/lib/prisma_type';
import ServerCard from './server-card';
import ServerListSkeleton from './server-list-skeleton';

type ServerListProps = {
  servers: PublicServer[];
  isLoading?: boolean;
  skeletonCount?: number;
};

export default function ServerList({
  servers,
  isLoading = false,
  skeletonCount = 10,
}: ServerListProps) {
  // 如果正在載入，顯示骨架屏
  if (isLoading) {
    return <ServerListSkeleton count={skeletonCount} />;
  }

  // 如果沒有服務器數據，顯示空狀態
  if (!servers || servers.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10">
        <p className="text-sm">找不到符合條件的伺服器 🙁</p>
      </div>
    );
  }

  // 正常顯示服務器列表
  return (
    <div className="space-y-4">
      {servers.map(server => (
        <ServerCard key={server.id} server={server} />
      ))}
    </div>
  );
}
