import React from "react";

const Header: React.FC = () => {
  return (
    <div
      className="bg-cover bg-center p-4 mb-4 rounded-lg"
      style={{
        backgroundImage: "https://i.postimg.cc/FKnDNtTx/DCHUSB-banner.png",
      }}
    >
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0 flex flex-col items-center md:items-start justify-center">
          <h1 className="text-xl md:text-2xl font-bold">Discord 伺服器列表</h1>
          <p className="text-sm">搜尋、加入、創建伺服器</p>
        </div>
        <img
          src="https://i.postimg.cc/qMdQkxxW/DH-2.png"
          alt="logo"
          className="h-16 md:h-20 rounded-lg align-middle"
        />
      </div>
    </div>
  );
};

export default Header;
