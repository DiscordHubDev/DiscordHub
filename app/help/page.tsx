/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";

const Page: React.FC = () => {
  return (
    <div className="py-10 bg-gray-700">
      <div className="container mx-auto px-4" style={{ maxWidth: "1200px" }}>
        <h1 className="text-3xl font-bold mb-6 text-center">
          DiscordHub 使用教學
        </h1>
        <div className="flex flex-col space-y-8">
          <div className="bg-black p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">步驟一：註冊與登入</h2>
            <p className="mb-4">
              首先，開啟DiscordHub網站，點選頁面右上角的「登入/註冊」按鈕。如果您還沒有帳號，請按照指示完成註冊，填寫必要的信息，如郵箱流程、使用者名稱和密碼等。註冊完成後，使用剛才設定的帳號資訊進行登入。
            </p>
            <img
              src="https://i.postimg.cc/FKnDNtTx/DCHUSB-banner.png"
              alt="註冊登入示意圖"
              className="mt-4 w-full h-48 object-cover rounded-lg"
            />
          </div>
          <div className="bg-black p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">步驟二：探索機器人功能</h2>
            <p className="mb-4">
              登入成功後，您可以在首頁看到各種熱門機器人推薦。點擊您有興趣的機器人，進入該機器人的詳情頁面。在詳情頁面，您可以查看機器人的功能介紹、使用說明以及其他使用者的評價資訊。
            </p>
            <img
              src="https://i.postimg.cc/FKnDNtTx/DCHUSB-banner.png"
              alt="機器人功能示意圖"
              className="mt-4 w-full h-48 object-cover rounded-lg"
            />
          </div>
          <div className="bg-black p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">
              步驟三：新增機器人到伺服器
            </h2>
            <p className="mb-4">
              當你確定要使用某個機器人時，在機器人詳情頁面找到「新增到伺服器」按鈕，點擊它並按照提示選擇你想要新增機器人的Discord伺服器。確認授權後，機器人就會成功加入你的伺服器中，你就可以開始使用它的各種功能啦。
            </p>
            <img
              src="https://i.postimg.cc/FKnDNtTx/DCHUSB-banner.png"
              alt="增加機器人示意圖"
              className="mt-4 w-full h-48 object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
