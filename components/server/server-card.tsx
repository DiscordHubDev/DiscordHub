'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { MinimalServerInfo } from '@/lib/get-user-guild';
import { getServerByGuildId } from '@/lib/actions/servers';
import { AvatarFallbackClient } from '../AvatarFallbackClient';

function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
interface ServerCardProps {
  server: MinimalServerInfo;
}

export function ServerCard({ server }: ServerCardProps) {
  const isPublished = server.isPublished;

  const [imgError, setImgError] = useState(false);
  const isClient = useIsClient();

  if (!isClient) return null;

  const buttonText = server.isInServer
    ? isPublished
      ? '編輯伺服器'
      : '發布伺服器'
    : '邀請機器人';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!server.isInServer) {
      window.open(
        `https://discord.com/oauth2/authorize?client_id=1324996138251583580&permissions=1126965059046400&integration_type=0&scope=bot&guild_id=${server.id}&disable_guild_select=true`,
        '_blank',
      );
      return;
    }

    if (!isPublished) {
      window.location.href = `/add-server/${server.id}`;
      return;
    }
    window.location.href = `/profile/servers/${server.id}/edit`;
  };

  return (
    <>
      <Card className="overflow-hidden bg-[#2f3136] border-[#1e1f22] transition-all duration-200 hover:shadow-md hover:shadow-[#5865f2]/10 hover:-translate-y-1">
        {/* Banner */}
        <div className="relative h-35 w-full">
          {server.banner !== '' ? (
            <Image
              src={server.banner}
              alt={`${server.name} banner`}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[#2f3136]" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#2f3136] to-transparent/0 opacity-70" />
        </div>

        {/* Server Icon */}
        <div className="relative -mt-8 ml-4">
          <Avatar className="w-16 h-16 border-4 border-[#2f3136] bg-[#36393f]">
            <AvatarImage
              className="object-cover w-full h-full"
              src={!imgError && server.icon !== '' ? server.icon : undefined}
              alt={`${server.name} icon`}
              onError={() => setImgError(true)}
            />

            <AvatarFallback suppressHydrationWarning>
              <AvatarFallbackClient name={server.name} defaultChar="?" />
            </AvatarFallback>
          </Avatar>
        </div>

        <CardContent className="pt-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-white text-lg truncate max-w-[200px]">
                {server.name}
              </h3>
              {server.isInServer && server.memberCount && (
                <p className="text-[#b9bbbe] text-sm">
                  {server.memberCount.toLocaleString()} 位成員
                </p>
              )}
            </div>
            <Badge
              className={cn(
                'mt-1',
                server.isInServer
                  ? 'bg-[#3ba55c] hover:bg-[#3ba55c]/90'
                  : 'bg-[#ed4245] hover:bg-[#ed4245]/90',
              )}
            >
              {server.isInServer ? '已加入' : '未加入'}
            </Badge>
          </div>
        </CardContent>

        <CardFooter className="border-t border-[#40444b] pt-3 pb-4">
          <button
            onClick={handleClick}
            className={cn(
              'w-full py-2 rounded-md font-medium text-sm transition-colors cursor-pointer',
              server.isInServer
                ? 'bg-[#4f545c] hover:bg-[#686d73] text-white'
                : 'bg-[#5865f2] hover:bg-[#4752c4] text-white',
            )}
          >
            {buttonText}
          </button>
        </CardFooter>
      </Card>
    </>
  );
}
