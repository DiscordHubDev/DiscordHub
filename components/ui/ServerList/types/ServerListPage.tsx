import React from "react";
import Header from "./Header";
import Search from "./Search";
import PopularServers from "./PopularServers";

const ServerListPage: React.FC = () => {
  return (
    <div className="bg-gray-900 text-blue rounded-lg w-full overflow-x-hidden">
      <Header />
      <Search />
      <PopularServers />
    </div>
  );
};

export default ServerListPage;
