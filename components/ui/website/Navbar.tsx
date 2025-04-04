"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";
import { FaDiscord } from "react-icons/fa";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <nav className="bg-[#2b2d31] border-b border-[#1e1f22]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-white flex items-center"
            >
              <span className="text-[#5865f2] mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-message-square-more"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <path d="M8 10h.01" />
                  <path d="M12 10h.01" />
                  <path d="M16 10h.01" />
                </svg>
              </span>
              DiscordHubs
            </Link>
            <div className="hidden md:flex ml-10 space-x-4">
              <NavLinks pathname={pathname} />
            </div>
          </div>

          <div className="hidden md:block">
            {session && session?.user ? (
              <Link href="/profile">
                <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white">
                  個人資料
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() => signIn("discord")}
                className="bg-[#5865f2] hover:bg-[#4752c4] text-white"
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
          {session && session?.user ? (
            <Link href="/profile">
              <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white">
                個人資料
              </Button>
            </Link>
          ) : (
            <Button
              onClick={() => signIn("discord")}
              className="bg-[#5865f2] hover:bg-[#4752c4] text-white"
            >
              登入 Discord
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLinks({
  pathname,
  mobile = false,
}: {
  pathname: string;
  mobile?: boolean;
}) {
  const links = [
    { href: "/", label: "伺服器列表" },
    { href: "/bots", label: "機器人列表" },
    { href: "/add-server", label: "新增伺服器" },
    { href: "/add-bot", label: "新增機器人" },
  ];

  const linkClass = (href: string) =>
    mobile
      ? `block text-white w-full text-left px-4 py-2 hover:bg-[#36393f] ${
          pathname === href ? "bg-white/10" : ""
        }`
      : `text-white hover:bg-[#36393f] ${
          pathname === href ? "bg-white/10" : ""
        }`;

  return (
    <>
      {links.map(({ href, label }) => (
        <Link key={href} href={href} passHref>
          <Button variant="ghost" className={linkClass(href)}>
            {label}
          </Button>
        </Link>
      ))}
    </>
  );
}
