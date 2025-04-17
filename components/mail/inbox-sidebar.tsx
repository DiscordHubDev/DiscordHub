'use client';

import * as React from 'react';
import {
  CheckCircle,
  Info,
  AlertTriangle,
  AlertCircle,
  Trash2,
} from 'lucide-react';

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EmailPriority, Mail } from '@/lib/types';
import { useInbox } from '@/hooks/use-inbox';

// 獲取優先級對應的圖標
export const getPriorityIcon = (priority: EmailPriority) => {
  switch (priority) {
    case 'success':
      return <CheckCircle className="size-4" />;
    case 'info':
      return <Info className="size-4" />;
    case 'warning':
      return <AlertTriangle className="size-4" />;
    case 'danger':
      return <AlertCircle className="size-4" />;
  }
};

// 獲取優先級對應的顏色類
export const getPriorityColorClass = (
  priority: EmailPriority,
  isRead: boolean,
) => {
  console.log('priority', priority);
  const baseClass = isRead ? 'opacity-70 ' : '';

  switch (priority) {
    case 'success':
      return (
        baseClass +
        'border-l-4 border-green-500 bg-green-50 dark:bg-green-950/30'
      );
    case 'info':
      return (
        baseClass + 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30'
      );
    case 'warning':
      return (
        baseClass +
        'border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30'
      );
    case 'danger':
      return (
        baseClass + 'border-l-4 border-red-500 bg-red-50 dark:bg-red-950/30'
      );
  }
};

// 獲取優先級對應的文字顏色
export const getPriorityTextClass = (priority: EmailPriority) => {
  switch (priority) {
    case 'success':
      return 'text-green-700 dark:text-green-400';
    case 'info':
      return 'text-blue-700 dark:text-blue-400';
    case 'warning':
      return 'text-amber-700 dark:text-amber-400';
    case 'danger':
      return 'text-red-700 dark:text-red-400';
  }
};

interface InboxSidebarProps {
  mails: Mail[];
  onSelectEmail: (email: Mail) => void;
  onDeleteEmail: (mailId: string) => void;
}

export function InboxSidebar({
  mails,
  onSelectEmail,
  onDeleteEmail,
}: InboxSidebarProps) {
  const { markAsRead } = useInbox();

  // 處理郵件點擊
  const handleEmailClick = (mail: Mail) => {
    // 更新為已讀狀態
    if (!mail.read) {
      markAsRead(mail.id);
      onSelectEmail({ ...mail, read: true });
    } else {
      onSelectEmail(mail);
    }
  };

  // 處理郵件刪除
  const handleDeleteEmail = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    console.log(id);

    try {
      onDeleteEmail(id);
    } catch (error) {
      console.error('❌ 刪除郵件失敗：', error);
    }
  };

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>郵件 ({mails.length})</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {mails.length > 0 ? (
              mails.map(mail => (
                <SidebarMenuItem key={mail.id} className="mb-3">
                  <div
                    className={cn(
                      'w-full rounded-md p-4 transition-colors cursor-pointer hover:brightness-95 dark:hover:brightness-125',
                      getPriorityColorClass(mail.priority, mail.read),
                    )}
                    onClick={() => handleEmailClick(mail)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span
                          className={cn(
                            'mr-2',
                            getPriorityTextClass(mail.priority),
                          )}
                        >
                          {getPriorityIcon(mail.priority)}
                        </span>
                        <span className="font-medium">{mail.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground mr-2">
                          {mail.createdAt}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive cursor-pointer"
                          onClick={e => handleDeleteEmail(mail.id, e)}
                        >
                          <Trash2 className="size-4" />
                          <span className="sr-only">刪除</span>
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h4 className="text-sm font-semibold">{mail.subject}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {mail.teaser}
                      </p>
                    </div>
                    {!mail.read && (
                      <div className="mt-2 flex justify-end">
                        <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                      </div>
                    )}
                  </div>
                </SidebarMenuItem>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-muted-foreground">
                沒有郵件
              </div>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
