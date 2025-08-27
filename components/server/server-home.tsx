'use client';

import { ServerGrid } from '@/components/server/server-grid';
import type { MinimalServerInfo } from '@/lib/get-user-guild';

interface Props {
  activeServers: MinimalServerInfo[];
  inactiveServers: MinimalServerInfo[];
}

export default function ServerClient({
  activeServers,
  inactiveServers,
}: Props) {
  return (
    <div className="min-h-dvh bg-[#36393f] text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">擁有的伺服器</h1>
          <p className="text-[#b9bbbe]">查看機器人是否在你想發布的伺服器中</p>
        </header>

        {activeServers.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-3 w-3 rounded-full bg-[#3ba55c]"></div>
              <h3 className="font-medium">已加入機器人的伺服器</h3>
            </div>
            <ServerGrid servers={activeServers} />
          </div>
        )}

        {inactiveServers.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-3 w-3 rounded-full bg-[#ed4245]"></div>
              <h3 className="font-medium">未加入機器人的伺服器</h3>
            </div>
            <ServerGrid servers={inactiveServers} />
          </div>
        )}
      </div>
    </div>
  );
}
