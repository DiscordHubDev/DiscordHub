"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { FaBars, FaBook, FaRobot, FaServer } from "react-icons/fa";
import { SidebarTrigger } from "../sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DiscordLoginButton from "./DiscordLogin";

const Navbar = () => {
  return (
    <nav className="sticky top-0 bg-transparent p-4 z-10">
      <div
        className="container mx-auto flex flex-col md:flex-row justify-between items-center"
        style={{ maxWidth: "1170px" }}
      >
        <SidebarTrigger className="fixed top-4 left-4 md:hidden" />

        <DropdownMenu>
          <DropdownMenuTrigger className="fixed top-4 right-4 md:hidden">
            <FaBars className="h-6 w-6" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>選擇類別</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>機器人</DropdownMenuItem>
            <DropdownMenuItem>伺服器</DropdownMenuItem>
            <DropdownMenuItem>使用教學</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="text-white text-xl font-bold mb-4 md:mb-0">
          DiscordHub
        </div>
        <div className="hidden md:flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <Button
            variant="secondary"
            className="bg-transparent hover:bg-[#1e222b] text-white text-md font-bold flex items-center flex-shrink-0 h-12 w-auto"
          >
            <FaRobot
              className="mr-2"
              style={{ height: "1.75rem", width: "1.75rem" }}
            />
            機器人
          </Button>
          <Button
            variant="secondary"
            className="bg-transparent hover:bg-[#1e222b] text-white text-md font-bold flex items-center flex-shrink-0 h-12 w-auto"
          >
            <FaServer
              className="mr-2"
              style={{ height: "1.45rem", width: "1.45rem" }}
            />
            伺服器
          </Button>
          <Button
            variant="secondary"
            className="bg-transparent hover:bg-[#1e222b] text-white text-md font-bold flex items-center flex-shrink-0 h-12 w-auto"
          >
            <FaBook
              className="mr-2"
              style={{ height: "1.45rem", width: "1.45rem" }}
            />
            使用教學
          </Button>
          <DiscordLoginButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
