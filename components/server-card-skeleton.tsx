export default function ServerCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden bg-[#2b2d31] border border-[#1e1f22] animate-pulse">
      <div className="flex flex-col md:flex-row">
        {/* Mobile Banner Skeleton */}
        <div className="w-full h-32 md:hidden bg-[#36393f]"></div>

        <div className="flex-grow p-4 md:p-5">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Desktop Icon Skeleton */}
            <div className="hidden md:block flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-[#36393f]"></div>
            </div>

            {/* Mobile Header Skeleton */}
            <div className="flex items-center md:hidden mb-3">
              <div className="w-10 h-10 rounded-full bg-[#36393f] mr-3"></div>
              <div className="flex flex-col space-y-2">
                <div className="h-5 bg-[#36393f] rounded w-32"></div>
                <div className="h-4 bg-[#36393f] rounded w-24"></div>
              </div>
            </div>

            <div className="flex-grow">
              {/* Desktop Header Skeleton */}
              <div className="hidden md:flex md:flex-row md:items-center justify-between mb-2">
                <div className="flex flex-row space-x-3">
                  <div className="h-6 bg-[#36393f] rounded w-40"></div>
                  <div className="h-6 bg-[#36393f] rounded w-20"></div>
                </div>
                <div className="h-8 bg-[#36393f] rounded w-24"></div>
              </div>

              {/* Description Skeleton */}
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-[#36393f] rounded w-full"></div>
                <div className="h-4 bg-[#36393f] rounded w-3/4"></div>
              </div>

              {/* Tags Skeleton */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="h-6 bg-[#36393f] rounded-full w-16"
                  ></div>
                ))}
              </div>

              {/* Stats Skeleton */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 md:mb-0">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center">
                    <div className="w-4 h-4 bg-[#36393f] rounded mr-1"></div>
                    <div className="h-4 bg-[#36393f] rounded w-16"></div>
                  </div>
                ))}
              </div>

              {/* Mobile Button Skeleton */}
              <div className="mt-4 md:hidden">
                <div className="h-8 bg-[#36393f] rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
