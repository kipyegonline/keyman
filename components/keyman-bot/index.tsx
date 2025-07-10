import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  ShoppingCart,
  Plus,
  Bot,
  User,
  Package,
  Wrench,
  Hammer,
  HardHat,
} from "lucide-react";
import { Image } from "@mantine/core";
import { useAppContext } from "@/providers/AppContext";
import { useQuery } from "@tanstack/react-query";
import {
  createThread,
  getMessageCount,
  getMessages,
  getThreads,
  sendMessage,
} from "@/api/chatbot";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  component?: React.ReactNode;
}

interface ConstructionItem {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: React.ReactNode;
}
/*eslint-disable*/
const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your construction assistant. I can help you find materials, answer questions, and manage your cart. How can I assist you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [cart, setCart] = useState<ConstructionItem[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { chatMode } = useAppContext();
  // get the thread ID from the API
  const { data, isLoading } = useQuery({
    queryKey: ["chatbot-threads"],
    queryFn: async () => await createThread(),
    enabled: isOpen,
  });

  const threadId = React.useMemo(() => {
    if (data?.thread) return data.thread.id;
    return "";
  }, [data]);

  // get message count for the thread
  const {
    data: messageCountData,
    isLoading: isMessageCountLoading,
    refetch: refetchCount,
  } = useQuery({
    queryKey: ["chatbot-message-count", threadId],
    queryFn: async () => await getMessageCount(threadId),
    refetchOnWindowFocus: false,
    enabled: !!threadId,
  });
  const messageCount = React.useMemo(() => {
    if (messageCountData?.count) return messageCountData.count;
    return 0;
  }, [messageCountData]);
  // get messages

  const {
    data: messagesData,
    isLoading: isMessagesLoading,
    refetch: refetchMesages,
  } = useQuery({
    queryKey: ["chatbot-messages", threadId],
    queryFn: async () => await getMessages(threadId),
    refetchOnWindowFocus: false,
    enabled: !!threadId,
  });
  const _messages = React.useMemo(() => {
    if (messagesData?.thread) {
      return messagesData.thread?.messages;
      /*.map(
        (msg: Record<string, string>) => ({
          id: msg.id,
          text: msg.content,
          sender: msg.role === "user" ? "user" : "bot",
          timestamp: new Date(msg.created_at),
          component: msg.component ? JSON.parse(msg.component) : null,
        })
      );*/
    }
    return [];
  }, [messagesData]);
  // send message to the thread

  const {
    data: sendMessageData,
    isLoading: isSendMessageLoading,
    isSuccess: messageSuccess,
  } = useQuery({
    queryKey: ["chatbot-send-message", inputValue],
    queryFn: async () =>
      await sendMessage(threadId, {
        content: inputValue,
        type: "text",
      }),
    refetchOnWindowFocus: false,
    enabled: sending,
  });
  // get threads
  const { data: threadsData, isLoading: isThreadsLoading } = useQuery({
    queryKey: ["chatbot-threads"],
    queryFn: async () => await getThreads(),
    refetchOnWindowFocus: false,
    enabled: false,
  });

  React.useEffect(() => {
    if (chatMode && !isOpen) {
      setIsOpen(true);
    }
  }, [chatMode]);
  React.useEffect(() => {
    if (messageSuccess && sendMessageData?.status) {
      console.log("Message sent successfully", sendMessageData);
      const newMessage: Message = {
        id: Date.now().toString(),
        text: sendMessageData.message.content,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
      // setInputValue("");
      setTimeout(() => {
        refetchMesages();
        refetchCount();
      }, 2000);
    }
  }, [messageSuccess]);

  const constructionItems: ConstructionItem[] = [
    {
      id: "1",
      name: "Steel Rebar",
      price: 45.99,
      description: "High-grade steel reinforcement bars",
      icon: <Wrench className="w-5 h-5" />,
    },
    {
      id: "2",
      name: "Concrete Mix",
      price: 12.5,
      description: "Premium concrete mix 50lb bag",
      icon: <Package className="w-5 h-5" />,
    },
    {
      id: "3",
      name: "Safety Helmet",
      price: 29.99,
      description: "OSHA compliant hard hat",
      icon: <HardHat className="w-5 h-5" />,
    },
    {
      id: "4",
      name: "Hammer Drill",
      price: 189.99,
      description: "Professional grade hammer drill",
      icon: <Hammer className="w-5 h-5" />,
    },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addToCart = (item: ConstructionItem) => {
    setCart((prev) => [...prev, item]);

    const botMessage: Message = {
      id: Date.now().toString(),
      text: `Great choice! I've added ${item.name} ($${
        item.price
      }) to your cart. Your cart now has ${cart.length + 1} items.`,
      sender: "bot",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);
  };

  const ConstructionItemsList = () => (
    <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200 max-w-sm">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">
        Construction Items
      </h3>
      <div className="space-y-3">
        {constructionItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="text-[#3D6B2C]">{item.icon}</div>
              <div>
                <p className="font-medium text-sm text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-600">{item.description}</p>
                <p className="text-sm font-semibold text-[#388E3C]">
                  ${item.price}
                </p>
              </div>
            </div>
            <button
              onClick={() => addToCart(item)}
              className="bg-[#3D6B2C] hover:bg-[#2d5220] text-white p-2 rounded-full transition-colors transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const simulateBotResponse = (userMessage: string) => {
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      let botResponse = "";
      let component = null;

      const lowerMessage = userMessage.toLowerCase();

      if (
        lowerMessage.includes("items") ||
        lowerMessage.includes("materials") ||
        lowerMessage.includes("products")
      ) {
        botResponse =
          "Here are our available construction items. Click the + button to add items to your cart:";
        component = <ConstructionItemsList />;
      } else if (lowerMessage.includes("cart")) {
        botResponse = `You have ${
          cart.length
        } items in your cart. Total value: $${cart
          .reduce((sum, item) => sum + item.price, 0)
          .toFixed(2)}`;
      } else if (
        lowerMessage.includes("hello") ||
        lowerMessage.includes("hi")
      ) {
        botResponse =
          "Hello! I'm here to help you with construction materials and tools. Would you like to see our available items?";
      } else if (lowerMessage.includes("help")) {
        botResponse =
          "I can help you with:\n• Browse construction materials\n• Add items to your cart\n• Check your cart status\n• Answer questions about our products\n\nWhat would you like to do?";
      } else {
        botResponse =
          "I understand you're asking about construction materials. Would you like me to show you our available items, or do you have a specific question about our products?";
      }

      const newMessage: Message = {
        id: Date.now().toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
        component: component,
      };

      setMessages((prev) => [...prev, newMessage]);
    }, 1000 + Math.random() * 1000);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setSending(true);

      setTimeout(() => {
        setSending(false);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const minimizeChatbot = () => {
    setIsMinimized(true);
  };

  const restoreChatbot = () => {
    setIsMinimized(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Window */}
      <div
        className={`
        absolute bottom-16 right-0 w-72 sm:w-72 max-h-[80vh] bg-white rounded-2xl shadow-2xl
        transform transition-all duration-300 ease-in-out flex flex-col
        ${
          isOpen
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-4 opacity-0 scale-95 pointer-events-none"
        }
        ${isMinimized ? "h-12" : "h-[min(400px,80vh)]"}
      `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3D6B2C] to-[#388E3C] text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div>
              <Image
                alt=""
                src="/keyman_logo.png"
                className="w-8 h-8 rounded-full shadow-lg"
              />
            </div>
            <div>
              <h3 className="font-semibold">Keyman Assistant</h3>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {cart.length > 0 && (
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-[#F08C23] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              </div>
            )}
            <button
              onClick={minimizeChatbot}
              className="hover:bg-white/20 p-1 rounded transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={toggleChatbot}
              className="hover:bg-white/20 p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Restore button when minimized */}
        {isMinimized && (
          <div className="p-2">
            <button
              onClick={restoreChatbot}
              className="text-[#3D6B2C] hover:text-[#2d5220] text-sm font-medium"
            >
              Click to restore chat
            </button>
          </div>
        )}

        {/* Messages Container */}
        {!isMinimized && (
          <>
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 min-h-0">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`
                      max-w-[80%] rounded-2xl px-4 py-2 shadow-sm
                      ${
                        message.sender === "user"
                          ? "bg-[#3D6B2C] text-white"
                          : "bg-white text-gray-800 border border-gray-200"
                      }
                    `}
                    >
                      <div className="flex items-start space-x-2">
                        {message.sender === "bot" && (
                          <Bot className="w-4 h-4 mt-1 text-[#3D6B2C]" />
                        )}
                        {message.sender === "user" && (
                          <User className="w-4 h-4 mt-1 text-white" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-line">
                            {message.text}
                          </p>
                          {message.component && (
                            <div className="mt-3">{message.component}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 border border-gray-200 rounded-2xl px-4 py-2 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4 text-[#3D6B2C]" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3D6B2C] focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="bg-[#3D6B2C] hover:bg-[#2d5220] disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-colors transform hover:scale-105"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={toggleChatbot}
        className={`
          w-14 h-14 bg-gradient-to-r from-[#3D6B2C] to-[#388E3C] text-white rounded-full shadow-lg
          flex items-center justify-center transition-all duration-300 hover:scale-110
          ${isOpen ? "rotate-90" : "rotate-0"}
        `}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Notification Badge */}
      {!isOpen && cart.length > 0 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#F08C23] text-white text-xs rounded-full flex items-center justify-center animate-pulse">
          {cart.length}
        </div>
      )}
    </div>
  );
};

export default ChatBot;
