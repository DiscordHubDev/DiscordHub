import React, { useState } from "react";

const SearchPopularBot: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearch = () => {
    // 搜尋
    console.log("搜尋：", searchTerm);
  };
  return (
    <div className="p-4 bg-gray-800 rounded-lg mx-4">
      <div className="relative">
        <input
          type="text"
          placeholder="搜尋機器人..."
          className="w-full p-2 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="absolute right-0 top-0 mt-2 mr-2"
          onClick={handleSearch}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SearchPopularBot;
