import React, { useState, useRef } from "react";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { useAppContext } from "@/providers/AppContext";

export default function DashboardSearch() {
  const [searchValue, setSearchValue] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showAITransition, setShowAITransition] = useState(false);
  const searchRef = useRef(null);

  const { toggleChatMode, setChatMessage } = useAppContext();

  const activateAIMode = () => {
    toggleChatMode();
    setShowAITransition(false);
    setChatMessage(searchValue);
    setTimeout(() => setSearchValue(""), 1000);

    // Add initial message if there's a search query
    if (searchValue.trim()) {
      /* setMessages([
        { type: "user", content: searchValue },
        {
          type: "ai",
          content: `I'd be happy to help you with "${searchValue}". What specific information do you need about materials, prices, or construction?`,
        },
      ]);*/
    }
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    // Show AI transition hint after 3 characters or if conversational
    if (value.trim().length > 2) {
      setShowAITransition(true);
    } else {
      setShowAITransition(false);
    }
  };
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchValue.trim().length > 2) {
      toggleChatMode();
      setChatMessage(searchValue);
      setTimeout(() => setSearchValue(""), 1000);
      e.preventDefault();
    }
  };
  return (
    <div className="max-w-6xl mx-auto mb-8">
      <div className="relative">
        {/* Main search bar with AI integration */}
        <div
          className={`relative transition-all duration-300 ${
            isSearchFocused ? "transform scale-105" : ""
          }`}
        >
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  showAITransition
                    ? "bg-gradient-to-r from-green-400 to-orange-600"
                    : "bg-green-100"
                }`}
              >
                {showAITransition ? (
                  <Sparkles className="w-3 h-3 text-white animate-pulse" />
                ) : (
                  <Search className="w-3 h-3 text-green-600" />
                )}
              </div>
            </div>

            <input
              ref={searchRef}
              type="text"
              value={searchValue}
              onKeyDown={handleKey}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Ask Keyman AI about materials, prices, or construction tips..."
              className={`w-full pl-14 pr-32 py-4 rounded-2xl border-2 transition-all duration-300 text-lg ${
                isSearchFocused
                  ? "border-green-400 shadow-lg shadow-green-100"
                  : "border-gray-200 hover:border-gray-300"
              } ${
                showAITransition
                  ? "bg-gradient-to-r from-green-50 to-blue-50"
                  : "bg-white"
              }`}
            />

            {/* AI transition button */}
            {showAITransition && (
              <button
                onClick={activateAIMode}
                className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-green-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-orange-600 transition-all duration-200 flex items-center gap-2 animate-pulse"
              >
                <Sparkles className="w-4 h-4" onClick={activateAIMode} />
                Ask AI
              </button>
            )}

            {/* Search/Send button */}
            <button
              onClick={showAITransition ? activateAIMode : undefined}
              //onClick={activateAIMode}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                showAITransition
                  ? "bg-gradient-to-r from-green-500 to-orange-500 text-white hover:from-green-600 hover:to-orange-600"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              {showAITransition ? (
                <ArrowRight className="w-5 h-5" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* AI hint text */}
        {showAITransition && (
          <div className="absolute top-full left-0 right-0 mt-2 text-center">
            <p className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm border inline-block">
              💡 This looks like a question - let Keyman AI help you!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
