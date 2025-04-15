'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
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
import { getSession, useSession } from 'next-auth/react';
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
      title: 'Playground',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'History',
          url: '#',
        },
        {
          title: 'Starred',
          url: '#',
        },
        {
          title: 'Settings',
          url: '#',
        },
      ],
    },
    {
      title: 'Models',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'Genesis',
          url: '#',
        },
        {
          title: 'Explorer',
          url: '#',
        },
        {
          title: 'Quantum',
          url: '#',
        },
      ],
    },
    {
      title: 'Documentation',
      url: '#',
      icon: BookOpen,
      items: [
        {
          title: 'Introduction',
          url: '#',
        },
        {
          title: 'Get Started',
          url: '#',
        },
        {
          title: 'Tutorials',
          url: '#',
        },
        {
          title: 'Changelog',
          url: '#',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#',
        },
        {
          title: 'Team',
          url: '#',
        },
        {
          title: 'Billing',
          url: '#',
        },
        {
          title: 'Limits',
          url: '#',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'Support',
      url: '#',
      icon: LifeBuoy,
    },
    {
      title: 'Feedback',
      url: '#',
      icon: Send,
    },
    {
      title: 'Admin',
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
    display_name: 'Not Login',
    username: 'Not Login',
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
  }, [search, mails, onlyUnread]);

  const navItem = [
    {
      title: 'Search',
      url: '#',
      icon: Search,
    },
    {
      title: 'Ask AI',
      url: '#',
      icon: Sparkles,
    },
    {
      title: 'Home',
      url: '#',
      icon: Home,
      isActive: true,
    },
    {
      title: 'Inbox',
      url: '#',
      icon: Inbox,
      badge: unreadCount > 0 ? String(unreadCount) : undefined,
      isActive: showInbox,
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
          display_name: session?.discordProfile?.global_name ?? 'Not Login',
          username: session?.discordProfile?.username ?? 'Not Login',
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
              if (title === 'Inbox') {
                setShowInbox(prev => !prev); // 切換 inbox 開關
              } else {
                setShowInbox(false); // 點其他項目時強制關閉 inbox
                setActiveItem(title); // 正常切換 active
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
                    Emails={filteredMails}
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
