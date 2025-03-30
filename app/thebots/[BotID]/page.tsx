import React from "react";

type BotDetailsProps = {
  params: {
    botId: string;
  };
};

const BotDetailsPage: React.FC<BotDetailsProps> = ({ params }) => {
  const botId = params.botId;
  // 後端獲取數據
  return (
    <div className="py-10">
      <div className="container mx-auto px-4" style={{ maxWidth: "1200px" }}>
        <h1>機器人 {botId} 的專屬頁面</h1>
      </div>
    </div>
  );
};
export default BotDetailsPage;
