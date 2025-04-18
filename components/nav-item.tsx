'use client';

import { useRouter } from 'next/navigation';
import { type LucideIcon } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';

export function NavItem({
  items,
  onSelect,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    badge?: string;
  }[];
  onSelect?: (title: string) => void;
}) {
  const router = useRouter();

  const pathname = usePathname();

  return (
    <SidebarMenu>
      {items.map(item => {
        const badgeDisplay =
          item.badge && !isNaN(Number(item.badge)) && Number(item.badge) > 99
            ? '99+'
            : item.badge;

        const handleClick = () => {
          onSelect?.(item.title);

          if (pathname === item.url) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            router.push(item.url);
          }
        };

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              isActive={item.isActive}
              onClick={handleClick}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="relative">
                  <item.icon size={15} />
                  {badgeDisplay && (
                    <span
                      className={clsx(
                        'absolute -top-1 -right-1',
                        'bg-red-500 text-white text-xs rounded-md  min-w-[1rem] text-center',
                      )}
                    >
                      {badgeDisplay}
                    </span>
                  )}
                </span>
                <span>{item.title}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
