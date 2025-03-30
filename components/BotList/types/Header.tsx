/* eslint-disable @next/next/no-img-element */
import React from "react";

const Header: React.FC = () => {
  return (
    <div
      className="bg-cover bg-center p-4 mb-4 rounded-lg"
      style={{
        backgroundImage: "https://i.postimg.cc/FKnDNtTx/DCHUSB-banner.png",
      }}
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Discord 機器人列表</h1>
          <p className="text-sm">機器人、機器人</p>
        </div>
        <img
          src="https://i.postimg.cc/qMdQkxxW/DH-2.png"
          alt="logo"
          className="h-20 rounded-lg"
        />
      </div>
    </div>
  );
};

export default Header;
