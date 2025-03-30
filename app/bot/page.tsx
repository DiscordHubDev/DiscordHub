"use client";

import React from "react";
import BotListPage from "@/components/BotList/types/BotListPage";

const Page: React.FC = () => {
  return (
    <div className="py-10">
      <div className="container mx-auto px-4" style={{ maxWidth: "1200px" }}>
        <BotListPage />
      </div>
    </div>
  );
};

export default Page;
