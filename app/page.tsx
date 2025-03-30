"use client";

import React from "react";
import ServerListPage from "../components/ui/ServerList/types/ServerListPage";

const Page: React.FC = () => {
  return (
    <div className="py-10">
      <div className="container mx-auto px-4" style={{ maxWidth: "1200px" }}>
        <ServerListPage />
      </div>
    </div>
  );
};

export default Page;
