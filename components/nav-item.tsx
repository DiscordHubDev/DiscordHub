'use client';

import { type LucideIcon } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import clsx from 'clsx'; // 用來組合 class（可選）

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
  return (
    <SidebarMenu>
      {items.map(item => {
        const badgeDisplay =
          item.badge && !isNaN(Number(item.badge)) && Number(item.badge) > 99
            ? '99+'
            : item.badge;

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={item.isActive}
              onClick={() => onSelect?.(item.title)}
            >
              <a href={item.url} className="flex items-center gap-2">
                <span className="relative">
                  <item.icon size={20} />
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
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
