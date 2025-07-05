import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  MessageCircle,
  Sparkles,
  ArrowRight,
  Send,
  X,
  Minimize2,
} from "lucide-react";

const SeamlessAIDashboard = () => {
  const [searchValue, setSearchValue] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showAITransition, setShowAITransition] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const searchRef = useRef(null);
  const chatInputRef = useRef(null);

  // Detect when user starts typing conversational queries
  const isConversationalQuery = (text) => {
    const conversationalPhrases = [
      "how do i",
      "what is",
      "tell me about",
      "help me",
      "can you",
      "what are",
      "how much",
      "where can",
      "why",
      "explain",
    ];
    return conversationalPhrases.some((phrase) =>
      text.toLowerCase().includes(phrase)
    );
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    // Show AI transition hint after 3 characters or if conversational
    if (value.length > 2 || isConversationalQuery(value)) {
      setShowAITransition(true);
    } else {
      setShowAITransition(false);
    }
  };

  // Activate AI chat mode
  const activateAIMode = () => {
    setChatMode(true);
    setShowAITransition(false);

    // Add initial message if there's a search query
    if (searchValue.trim()) {
      setMessages([
        { type: "user", content: searchValue },
        {
          type: "ai",
          content: `I'd be happy to help you with "${searchValue}". What specific information do you need about materials, prices, or construction?`,
        },
      ]);
    }
  };

  // Handle chat submission
  const handleChatSubmit = () => {
    if (searchValue.trim()) {
      const newMessage = { type: "user", content: searchValue };
      setMessages((prev) => [...prev, newMessage]);

      // Simulate AI response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: "ai",
            content: `Based on your query about "${searchValue}", here are some relevant construction materials and pricing information...`,
          },
        ]);
      }, 1000);

      setSearchValue("");
    }
  };

  // Handle Enter key in chat input
  const handleChatKeyPress = (e) => {
    if (e.key === "Enter") {
      handleChatSubmit();
    }
  };

  // Close chat and return to search
  const closeChatMode = () => {
    setChatMode(false);
    setMessages([]);
    setSearchValue("");
    setIsMinimized(false);
    if (searchRef.current) {
      searchRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with enhanced search */}
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
                      ? "bg-gradient-to-r from-green-400 to-blue-500"
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
                  className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-200 flex items-center gap-2 animate-pulse"
                >
                  <Sparkles className="w-4 h-4" />
                  Ask AI
                </button>
              )}

              {/* Search/Send button */}
              <button
                onClick={showAITransition ? activateAIMode : undefined}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  showAITransition
                    ? "bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600"
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
                💡 This looks like a question - let AI help you!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dashboard content */}
      <div className="max-w-6xl mx-auto">
        {/* Action buttons */}
        <div className="flex gap-4 mb-8">
          <button className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors">
            Request Item
          </button>
          <button className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            Top Up Keys
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-500 rounded"></div>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Pending Requests</p>
                <p className="text-2xl font-bold">55</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-orange-500 rounded"></div>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Keys Balance</p>
                <p className="text-2xl font-bold">123.5</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Active Orders</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div>
                    <p className="font-medium">Construction Material #{i}</p>
                    <p className="text-sm text-gray-600">Ordered 2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-bold mb-4">Recommended for You</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg"></div>
                  <div>
                    <p className="font-medium">Premium Material #{i}</p>
                    <p className="text-sm text-gray-600">
                      Based on your history
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Interface */}
      {chatMode && (
        <div
          className={`fixed bottom-6 right-6 transition-all duration-300 ${
            isMinimized ? "w-80 h-16" : "w-96 h-96"
          }`}
        >
          <div className="bg-white rounded-2xl shadow-2xl border h-full flex flex-col overflow-hidden">
            {/* Chat header */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold">Keyman AI Assistant</h3>
                  <p className="text-xs opacity-80">
                    Ready to help with construction
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={closeChatMode}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Chat messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>
                        Ask me anything about construction materials, pricing,
                        or tips!
                      </p>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.type === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-xl ${
                            message.type === "user"
                              ? "bg-gradient-to-r from-green-500 to-blue-500 text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Chat input */}
                <form onSubmit={handleChatSubmit} className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      ref={chatInputRef}
                      type="text"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Type your question..."
                      className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-2 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeamlessAIDashboard;
