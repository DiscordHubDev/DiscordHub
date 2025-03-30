import React from "react";
import Header from "./Header";
import Search from "./SearchBot";
import PopularBot from "./PopularBots";

const BotListPage: React.FC = () => {
  return (
    <div className="bg-gray-900 text-blue rounded-lg">
      <Header />
      <Search />
      <PopularBot />
    </div>
  );
};

export default BotListPage;
