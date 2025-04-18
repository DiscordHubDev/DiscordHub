'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signIn, useSession } from 'next-auth/react';
import { FaDiscord } from 'react-icons/fa';
import { SidebarTrigger } from '../sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';
import { Menu } from 'lucide-react';
import Image from 'next/image';

// 定义 LinkItem 类型，允许存在 onClick 属性
type LinkItem = {
  href: string;
  label: string;
  onClick?: () => void;
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <nav className="bg-[#2b2d31] border-b border-[#1e1f22]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:hidden">
          <div className="flex items-center justify-between md:hidden w-full px-4 py-2">
            <SidebarTrigger className="-mt-1" />
            <Link
              href="/"
              className="text-xl font-bold text-white flex items-center"
            >
              <span className="mr-2">
                <Image
                  src="/favicon.ico"
                  alt="Logo"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </span>
              DiscordHubs
            </Link>

            {/* 右側 NavLinks（你可以包個 dropdown 或 icon menu 也行） */}
            <div>
              <NavLinks pathname={pathname} mobile={true} session={session} />
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="text-xl font-bold text-white flex items-center"
            >
              <span className="mr-2">
                <Image
                  src="/favicon.ico"
                  alt="Logo"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </span>
              DiscordHubs
            </Link>
            <div className="hidden md:flex ml-10 space-x-4">
              <NavLinks pathname={pathname} session={session} />
            </div>
          </div>

          <div className="hidden md:block">
            {session && session?.user ? (
              <Link href="/profile">
                <Button className="cursor-pointer  bg-[#5865f2] hover:bg-[#4752c4] text-white">
                  個人資料
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() => signIn('discord')}
                className="cursor-pointer bg-[#5865f2] hover:bg-[#4752c4] text-white"
              >
                <FaDiscord />
                登入 Discord
              </Button>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden px-4 pb-4">
          <style jsx>{`
            button,
            a {
              white-space: normal;
              word-wrap: break-word;
              max-width: 100%;
            }
          `}</style>
          <NavLinks pathname={pathname} mobile={true} session={session} />
        </div>
      )}
    </nav>
  );
}

function NavLinks({
  pathname,
  mobile = false,
  session,
}: {
  pathname: string;
  mobile?: boolean;
  session: any;
}) {
  let links: LinkItem[] = [
    { href: '/', label: '伺服器列表' },
    { href: '/bots', label: '機器人列表' },
    { href: '/add-server', label: '新增伺服器' },
    { href: '/add-bot', label: '新增機器人' },
  ];

  if (session && session?.user) {
    // links = [
    //   ...links,
    //   { href: '/add-server', label: '新增伺服器' },
    //   { href: '/add-bot', label: '新增機器人' },
    // ];
    if (mobile) {
      links.push({ href: '/profile', label: '個人資料' });
    }
  } else {
    if (mobile) {
      links.push({
        href: '#',
        label: '登入 Discord',
        onClick: () => signIn('discord'),
      });
    }
  }

  if (mobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-[#2f3136] border-none">
          {links.map(({ href, label, onClick }) => (
            <DropdownMenuItem asChild key={href}>
              <Link
                href={href}
                onClick={e => {
                  if (onClick) {
                    e.preventDefault();
                    onClick();
                  }
                }}
                className={`text-white w-full px-2 py-1 text-sm hover:bg-[#36393f] ${
                  pathname === href ? 'bg-white/10' : ''
                }`}
              >
                {label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      {links.map(({ href, label, onClick }) => (
        <Link key={href} href={href} passHref>
          <Button
            variant="ghost"
            className={`text-white cursor-pointer hover:bg-[#36393f] ${
              pathname === href ? 'bg-white/10' : ''
            }`}
            onClick={e => {
              if (onClick) {
                e.preventDefault();
                onClick();
              }
            }}
          >
            {label}
          </Button>
        </Link>
      ))}
    </>
  );
}
