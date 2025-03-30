import React from "react";
import { Button } from "@/components/ui/button";
import { FaAddressBook, FaBook, FaRobot, FaServer } from "react-icons/fa";

const Navbar = () => {
  return (
    <nav className="bg-transparent p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-xl font-bold">DiscordHub</div>
        <div className="flex flex-row">
          <Button
            variant="secondary"
            className="mr-4 bg-transparent hover:bg-[#1e222b] text-white text-md font-bold flex items-center flex-shrink-0 h-12 w-auto"
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
