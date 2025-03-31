"use client";

import { useMemo, useState } from "react";
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
  Home,
  Inbox,
  Search,
  Sparkles,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
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
} from "@/components/ui/sidebar";
import { NavSecondary } from "./nav-secondary";
import { getSession, useSession } from "next-auth/react";
import { NavItem } from "./nav-item";
import { Separator } from "@radix-ui/react-separator";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Switch } from "./ui/switch";
import { Mail, MailItem } from "./ui/website/mail/MailItem";
import { MailViewer } from "./ui/website/mail/MailViewer";
import { useInbox } from "@/hooks/use-inbox";
import { NotificationListener } from "@/app/providers/NotificationProvider";

const data = {
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  navItem: [
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      title: "Ask AI",
      url: "#",
      icon: Sparkles,
    },
    {
      title: "Home",
      url: "#",
      icon: Home,
      isActive: true,
    },
    {
      title: "Inbox",
      url: "#",
      icon: Inbox,
      badge: "10",
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
};

export function DiscordUser(session?: any): DiscordUser {
  if (!session) {
    return {
      display_name: "Loading...",
      username: "Loading...",
      avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
    };
  }

  if (session.user) {
    return {
      display_name: session.discordProfile?.global_name ?? "Unknown",
      username: session.discordProfile?.username ?? "Unknown",
      avatar:
        session.discordProfile?.image_url ??
        "https://cdn.discordapp.com/embed/avatars/0.png",
    };
  }

  return {
    display_name: "Not Login",
    username: "Not Login",
    avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
  };
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, status } = useSession();
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const [selectedMail, setSelectedMail] = useState<Mail | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { mails, isLoading, addMail, markAsRead, deleteMail } = useInbox();

  const [search, setSearch] = useState("");

  const [onlyUnread, setOnlyUnread] = useState(false);

  const filteredMails = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return mails.filter((mail) => {
      const matchesSearch =
        !keyword ||
        [mail.subject, mail.teaser, mail.name].some((field) =>
          field?.toLowerCase().includes(keyword)
        );

      const matchesUnread = !onlyUnread || mail.read === false;

      return matchesSearch && matchesUnread;
    });
  }, [search, mails, onlyUnread]);

  const openMail = (mail: Mail) => {
    console.log("openMail", mail);
    console.log("id", mail.id);
    console.log("read", mail.read);
    setSelectedMail({ ...mail, read: true });
    setDialogOpen(true);
    if (!mail.read && mail.id) {
      markAsRead(mail.id);
    }
  };

  const user =
    status === "loading"
      ? {
          display_name: "Loading...",
          username: "Loading...",
          avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
        }
      : {
          display_name: session?.discordProfile?.global_name ?? "Not Login",
          username: session?.discordProfile?.username ?? "Not Login",
          avatar:
            session?.discordProfile?.image_url ??
            "https://cdn.discordapp.com/embed/avatars/0.png",
        };

  console.log("status:", status, session);

  return (
    <div className="flex h-screen">
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <SidebarTrigger />

          <NavItem
            items={data.navItem.map((item) => ({
              ...item,
              isActive: activeItem === item.title,
            }))}
            onSelect={(title) => setActiveItem(title)}
          />
        </SidebarHeader>
        <Separator className="h-[2px] bg-muted-foreground/30" />
        <SidebarContent>
          <NavMain items={data.navMain} />
          <NavSecondary items={data.navSecondary} className="mt-auto" />
        </SidebarContent>
        <SidebarFooter>
          <NavUser
            key={
              status === "authenticated"
                ? session?.user?.email
                : "unauthenticated"
            }
            user={user}
          />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeItem === "Inbox" && (
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
                onChange={(e) => setSearch(e.target.value)}
              />
            </SidebarHeader>
            <SidebarContent className="flex-1 overflow-y-auto">
              <SidebarGroup className="px-0">
                <SidebarGroupContent>
                  <NotificationListener
                    onNotify={(newMail) => {
                      addMail(newMail);
                    }}
                  />
                  {filteredMails.map((mail) => (
                    <MailItem
                      key={mail.id}
                      mail={mail}
                      onClick={() => {
                        openMail(mail);
                        console.log("開啟信件：", mail.subject);
                      }}
                      onDelete={async () => {
                        if (confirm("確定要刪除這封郵件嗎？")) {
                          try {
                            await deleteMail(mail.id);
                            alert("刪除成功！");
                          } catch (error) {
                            alert("刪除失敗！");
                          }
                        }
                      }}
                    />
                  ))}
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        )}
      </div>
      <MailViewer
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mail={selectedMail}
      />
    </div>
  );
}
