"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Flag,
  Server,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 h-8 w-8 text-white hover:bg-[#4E5058] lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-[#2F3136] text-white transition-all duration-300 lg:relative",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-14 items-center border-b border-[#202225] px-4">
          {!collapsed && (
            <span className="text-xl font-bold text-[#5865F2]">管理後臺</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute right-2 top-3 h-8 w-8 text-white hover:bg-[#4E5058] hidden lg:flex",
              collapsed && "right-3"
            )}
            onClick={() => setCollapsed(!collapsed)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            {[
              {
                name: "Bot Applications",
                href: "/dashboard/applications",
                icon: Bot,
              },
              { name: "Servers", href: "/dashboard/servers", icon: Server },
              { name: "Reports", href: "/dashboard/reports", icon: Flag },
              { name: "Users", href: "/dashboard/users", icon: Users },
              { name: "Settings", href: "/dashboard/settings", icon: Settings },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-[#4E5058] transition-colors",
                  pathname === item.href && "bg-[#4E5058]",
                  collapsed && "justify-center px-0"
                )}
              >
                <item.icon className="h-5 w-5" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-[#202225] p-2">
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-[#ED4245] transition-colors",
              collapsed && "justify-center px-0"
            )}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
}
