// app/bots/[botId]/page.tsx
import React from "react";

// 定義 props 類型
type BotDetailsProps = {
  params: {
    id: string;
  };
};

// 動態頁面本體
const BotDetailsPage: React.FC<BotDetailsProps> = ({ params }) => {
    const botId = decodeURIComponent(params.id);

  return (
    <div className="py-10">
      <div className="container mx-auto px-4" style={{ maxWidth: "1200px" }}>
        <h1>機器人 {botId} 的專屬頁面</h1>
      </div>
    </div>
  );
};

export default BotDetailsPage;

// 預生成路由（靜態生成）
export async function generateStaticParams() {
  // 假設你有幾個 botId 是預設要生成的
  const bots = ["bot-001", "bot-002", "bot-003"];

  return bots.map((botId) => ({
    botId,
  }));
}