'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Bot,
  Settings2,
  LifeBuoy,
  Send,
  SquareTerminal,
  ShieldPlus,
  Home,
  Inbox,
  Search,
  Sparkles,
  Menu,
  Blocks,
  BookUser,
  BookAIcon,
  BotIcon,
  BookImage,
  BookOpenIcon,
  BookText,
  BookPlusIcon,
  BookCheck,
  BookCheckIcon,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { NavSecondary } from './nav-secondary';
import { useSession } from 'next-auth/react';
import { NavItem } from './nav-item';
import { Separator } from '@radix-ui/react-separator';
import { Label } from '@radix-ui/react-dropdown-menu';
import { Switch } from './ui/switch';
import { useInbox } from '@/hooks/use-inbox';
import { NotificationListener } from '@/app/providers/NotificationProvider';
import { InboxSidebar } from './mail/inbox-sidebar';
import { EmailDialog } from './mail/mail-dialog';
import { Mail } from '@/lib/types';
import { Session } from 'next-auth';

const ADMIN_ID = ['857502876108193812', '549056425943629825'];

const data = {
  navMain: [
    {
      title: '支持作者們',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: '弦樂（DawnGS）',
          url: 'https://dawngs.xyz/',
        },
        {
          title: '鰻頭(´・ω・)（mantouisyummy）',
          url: 'https://github.com/Mantouisyummy',
        },
      ],
    },
    {
      title: '政策及條款',
      url: '#',
      icon: BookText,
      items: [
        {
          title: '服務條款',
          url: '/terms',
        },
        {
          title: '隱私權政策',
          url: '/privacy',
        },
      ],
    },
    {
      title: '不同的文檔',
      url: '#',
      icon: BookCheckIcon,
      items: [
        {
          title: '開發者文檔',
          url: '#',
        },
        {
          title: '等待更新1',
          url: '#',
        },
        {
          title: '等待更新2',
          url: '#',
        },
        {
          title: '等待更新3',
          url: '#',
        },
      ],
    },
    // {
    //   title: 'Settings',
    //   url: '#',
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: 'General',
    //       url: '#',
    //     },
    //     {
    //       title: 'Team',
    //       url: '#',
    //     },
    //     {
    //       title: 'Billing',
    //       url: '#',
    //     },
    //     {
    //       title: 'Limits',
    //       url: '#',
    //     },
    //   ],
    // },
  ],
  navSecondary: [
    {
      title: '獲得支援',
      url: 'https://discord.gg/puQ9DPdG3',
      icon: LifeBuoy,
    },
    {
      title: '回報問題',
      url: 'https://discord.gg/puQ9DPdG3',
      icon: Send,
    },
    {
      title: '管理員頁面',
      url: '/admin',
      icon: ShieldPlus,
      onlyFor: ADMIN_ID,
    },
  ],
};

export function DiscordUser(session?: Session): DiscordUser {
  if (!session) {
    return {
      display_name: 'Loading...',
      username: 'Loading...',
      avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
    };
  }

  if (session.user) {
    return {
      display_name: session.discordProfile?.global_name ?? 'Unknown',
      username: session.discordProfile?.username ?? 'Unknown',
      avatar:
        session.discordProfile?.image ??
        'https://cdn.discordapp.com/embed/avatars/0.png',
    };
  }

  return {
    display_name: '未登入',
    username: '未登入',
    avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
  };
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, status } = useSession();
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const [selectedMail, setSelectedMail] = useState<Mail | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { mails, addMail, markAsRead } = useInbox();

  const [search, setSearch] = useState('');

  const [onlyUnread, setOnlyUnread] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);
  const [showInbox, setShowInbox] = useState(false);

  useEffect(() => {
    refreshUnreadCount();
  }, [mails]);

  const refreshUnreadCount = () => {
    const count = mails.filter(mail => !mail.read).length;
    console.log('unread', count);
    setUnreadCount(count); // ✅ 這裡設定的是外層的 state
  };

  const filteredMails = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return mails.filter(mail => {
      const isUnread = !Boolean(mail.read); // 如果 mail.read 為 false、null、undefined 都算未讀
      const matchesUnread = !onlyUnread || isUnread;

      const matchesSearch =
        !keyword ||
        [mail.subject, mail.teaser, mail.name]
          .filter(Boolean)
          .some(field => field.toLowerCase().includes(keyword));

      return matchesSearch && matchesUnread;
    });
  }, [mails, search, onlyUnread]);

  const navItem = [
    {
      title: '返回首頁',
      url: '/',
      icon: Home,
      isActive: true,
    },
    {
      title: '教學頁面',
      url: 'help',
      icon: BookOpen,
    },
    {
      title: '加入官方群',
      url: 'https://discord.com/invite/puQ9DPdG3M',
      icon: Sparkles,
    },
    {
      title: '私人收件匣',
      url: '#',
      icon: Inbox,
      badge: unreadCount > 0 ? String(unreadCount) : undefined,
      isActive: showInbox,
    },
    {
      title: '邀請官方機器人',
      url: 'https://discord.com/oauth2/authorize?client_id=1324996138251583580&permissions=8&integration_type=0&scope=bot',
      icon: BotIcon,
    },
  ];

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const openMail = (mail: Mail) => {
    setSelectedMail({ ...mail, read: true });
    setDialogOpen(true);
    if (!mail.read && mail.id) {
      markAsRead(mail.id).then(() => {
        refreshUnreadCount();
      });
    }
  };

  const user =
    status === 'loading'
      ? {
          display_name: 'Loading...',
          username: 'Loading...',
          avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
          id: '',
        }
      : {
          display_name: session?.discordProfile?.global_name ?? '未登入',
          username: session?.discordProfile?.username ?? '未登入',
          avatar:
            session?.user?.image ??
            'https://cdn.discordapp.com/embed/avatars/0.png',
          id: session?.discordProfile?.id,
        };

  const filterednavSecondary = data.navSecondary.filter(item => {
    if (!item.onlyFor) return true;

    return !!user?.id && item.onlyFor.includes(user.id);
  });

  return (
    <div className="flex h-full">
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <SidebarTrigger />

          <NavItem
            items={navItem.map(item => ({
              ...item,
              isActive: activeItem === item.title,
            }))}
            onSelect={title => {

              if (title === '私人收件匣') {
                setShowInbox(prev => !prev); // 切換 inbox 開關
              } else {
                setShowInbox(false); // 點其他項目時強制關閉 inbox
                setActiveItem(prev => (prev === title ? null : title));
              }
            }}
          />
        </SidebarHeader>
        <Separator className="h-[2px] bg-muted-foreground/30" />
        <SidebarContent>
          <NavMain items={data.navMain} />
          <NavSecondary items={filterednavSecondary} className="mt-auto" />
        </SidebarContent>
        <SidebarFooter>
          <NavUser
            key={
              status === 'authenticated'
                ? session?.user?.email
                : 'unauthenticated'
            }
            user={user}
          />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <div className="flex-1 flex flex-col overflow-hidden">
        {showInbox && (
          <Sidebar collapsible="none" className="flex flex-col max-h-screen">
            <SidebarHeader className="shrink-0 border-b p-4">
              <div className="flex w-full items-center justify-between">
                <div className="text-base font-medium text-foreground">
                  收件匣
                </div>
                <Label className="flex items-center gap-2 text-sm">
                  <span>未讀</span>
                  <Switch
                    className="shadow-none"
                    checked={onlyUnread}
                    onCheckedChange={setOnlyUnread}
                  />
                </Label>
              </div>
              <SidebarInput
                placeholder="搜尋郵件..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </SidebarHeader>
            <SidebarContent className="flex-1 overflow-y-auto">
              <SidebarGroup className="px-0">
                <SidebarGroupContent>
                  <NotificationListener
                    onNotify={newMail => {
                      addMail(newMail);
                    }}
                  />
                  <InboxSidebar
                    mails={filteredMails}
                    onSelectEmail={mail => openMail(mail)}
                  />
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        )}
      </div>
      <EmailDialog
        email={selectedMail}
        open={dialogOpen}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
