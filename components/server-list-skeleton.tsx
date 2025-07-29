import ServerCardSkeleton from './server-card-skeleton';

type ServerListSkeletonProps = {
  count?: number;
};

export default function ServerListSkeleton({
  count = 10,
}: ServerListSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <ServerCardSkeleton key={i} />
      ))}
    </div>
  );
}
