import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  ShoppingCart,
  Plus,
  Minus,
  Bot,
  User,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Box,
  ArrowLeftRight,
  Key,
} from "lucide-react";
import { Badge, Card, Image, Text, TextInput } from "@mantine/core";
import { useAppContext } from "@/providers/AppContext";
import { useQuery } from "@tanstack/react-query";
import {
  createThread,
  getMessageCount,
  getMessages,
  sendMessage,
} from "@/api/chatbot";
import { DeliveryDate, DeliveryLocation } from "./DeliveryLocation";
import { Project } from "@/types";
import LoadingComponent from "@/lib/LoadingComponent";
import Link from "next/link";

// Interfaces
interface Product {
  description: string;
  id: string;
  name: string;
  photo: string;
  quantity: number;
}

interface CartItem extends Product {
  cartQuantity: number;
}

interface UserMessage {
  id: string;
  role: "user";
  content: string;
  timestamp: number;
}

interface BotMessage {
  id: string;
  role: "assistant";
  content: {
    action: string;
    content: string;
    items: Product[];
  };
  timestamp: number;
}

type Message = UserMessage | BotMessage;

// Item Component
const ItemCard: React.FC<{
  item: Product;
  onAddToCart: (item: Product, quantity: number) => void;
}> = ({ item, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    onAddToCart(item, quantity);
    setTimeout(() => {
      setIsAdding(false);
      setQuantity(1);
    }, 500);
  };

  return (
    <div className="bg-white rounded-xl  shadow-md hover:shadow-xl transition-all duration-300 p-4 w-40 flex-shrink-0 transform hover:scale-105">
      <div className="relative h-20 mb-3 hidden overflow-hidden rounded-lg bg-gray-100"></div>

      <h4 className="font-semibold text-gray-800 mb-1 truncate">
        <Box className="mr-2 inline-block" />
        {item.name}
      </h4>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2 hidden">
        {item.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            className="w-8 h-8 rounded-full bg-[#F08C23]/10 hover:bg-[#F08C23]/20 text-[#F08C23] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus size={16} />
          </button>
          <span className="font-medium text-gray-700 w-8 text-center">
            {quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(1)}
            className="w-8 h-8 rounded-full bg-[#F08C23]/10 hover:bg-[#F08C23]/20 text-[#F08C23] flex items-center justify-center transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      <button
        onClick={handleAddToCart}
        className={`px-4 py-1 w-full mt-2 rounded-lg font-medium transition-all duration-300 transform ${
          isAdding
            ? "bg-green-500 text-white scale-95"
            : "bg-[#3D6B2C] hover:bg-[#2d5220] text-white hover:scale-105"
        }`}
      >
        {isAdding ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <span className="text-sm">Add</span>
        )}
      </button>
    </div>
  );
};

// Item Slider Component
export const ItemSlider: React.FC<{
  items: Product[];
  onAddToCart: (item: Product, quantity: number) => void;
}> = ({ items, onAddToCart }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!items || items.length === 0) return null;
  console.log(items);
  return (
    <div className="relative mx-2  w-full">
      <Badge variant="filled" color="orange" size="xs">
        {items?.length} items available
      </Badge>

      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-gray-800/80 hover:bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
      >
        <ChevronLeft size={20} />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide py-4 px-4  w-full"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item) => (
          <ItemCard key={item.id} item={item} onAddToCart={onAddToCart} />
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-gray-800/80 hover:bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

// Cart Component
export const CartView: React.FC<{
  cart: CartItem[];
  onCheckout: () => void;
  onClose: () => void;
  locations: Project[];
  authInfo: {
    isLoggedIn: boolean;
    isMainDashboard: boolean;
    spinner: boolean;
    isValid: boolean;
    date: string;
  };
  sendLocation: (location: string) => void;
  sendDate: (date: string) => void;
  onCreateRequest: () => void;
  KSNumber: string;
  setKSNumber: React.Dispatch<React.SetStateAction<string>>;
  locationConfig: { refresh: () => void; location: string };
}> = ({
  cart,
  onCheckout,
  onClose,
  onCreateRequest,
  locations,
  authInfo,

  sendLocation,
  sendDate,
  KSNumber,
  setKSNumber,
  locationConfig,
}) => {
  //const totalItems = cart.reduce((sum, item) => sum + item.cartQuantity, 0);

  const checkoutSection = (
    <div>
      {" "}
      <div className="py-2">
        {" "}
        <DeliveryDate sendDate={sendDate} date={authInfo.date} />
      </div>
      <DeliveryLocation
        locations={locations}
        sendLocation={sendLocation}
        config={locationConfig}
      />
      <TextInput
        label=" KS number (optional)"
        py="sm"
        value={KSNumber}
        onChange={(e) => setKSNumber(e.target.value)}
      />
    </div>
  );
  const supplierSection = (
    <Card className=" bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 py-2 mb-2">
      <div className="text-center">
        <Text className=" text-gray-600" size="xs">
          You need to create this request from cutsomer dashboard
        </Text>
        <Link
          href="/keyman/dashboard/"
          className="inline-flex items-center gap-2 text-xs text-[#3D6B2C] hover:text-[#388E3C] font-medium"
        >
          <ArrowLeftRight size={16} /> Switch to Customer dashboard
        </Link>
      </div>
    </Card>
  );
  const UnloggedSection = (
    <Card className=" bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 py-2 mb-2">
      <div className="text-center">
        <Text className="text-gray-600" size="xs">
          You need to login in order complete checkout
        </Text>
        <Link
          href="/account/login"
          className="inline-flex items-center gap-2 text-xs text-[#3D6B2C] hover:text-[#388E3C] font-medium"
        >
          <Key size={16} /> Login
        </Link>
      </div>
    </Card>
  );

  return (
    <div className="bg-white rounded-xl shadow-xl p-4 mb-4 animate-in slide-in-from-top-2 duration-300">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">Your Cart</h3>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center text-sm"
          >
            <span className="text-gray-700">{item.name}</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              {item.cartQuantity}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <span className="font-medium text-gray-700">Total Items:</span>
          <span className="font-semibold text-[#3D6B2C]">{cart.length}</span>
        </div>
        <div>
          {authInfo.spinner ? (
            <LoadingComponent
              message="preparing checkout"
              size="sm"
              variant="minimal"
            />
          ) : !authInfo.isLoggedIn ? (
            UnloggedSection
          ) : authInfo.isMainDashboard ? (
            checkoutSection
          ) : (
            supplierSection
          )}
        </div>

        {!authInfo.isValid ? (
          <button
            onClick={onCheckout}
            disabled={authInfo.spinner}
            className="w-full py-2 bg-[#F08C23] hover:bg-[#d87a1f] text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
          >
            {authInfo.spinner ? "Preparing checkout..." : "Checkout"}
          </button>
        ) : (
          <button
            onClick={() => onCreateRequest()}
            disabled={authInfo.spinner}
            className="w-full py-2 bg-[#F08C23] hover:bg-[#d87a1f] text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
          >
            {authInfo.spinner ? "Submitting Request..." : "Create Request"}
          </button>
        )}
      </div>
    </div>
  );
};

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { chatMode, message } = useAppContext();

  // Get thread ID
  const { data: threadData } = useQuery({
    queryKey: ["chatbot-threads"],
    queryFn: async () => await createThread(),
  });

  const threadId = React.useMemo(() => {
    if (threadData?.thread) return threadData.thread.id;
    return "";
  }, [threadData]);

  // Get message count with controlled polling
  const { data: messageCountData } = useQuery({
    queryKey: ["chatbot-message-count", threadId],
    queryFn: async () => {
      const result = await getMessageCount(threadId);
      console.log("Message count fetched:", result?.count);
      return result;
    },
    refetchOnWindowFocus: false,
    enabled: !!threadId,
    refetchInterval: isWaitingForResponse ? 1000 : false,
    refetchIntervalInBackground: false,
  });

  const messageCount = React.useMemo(() => {
    return messageCountData?.count || 0;
  }, [messageCountData]);

  // Get messages when message count changes
  const { data: messagesData, refetch: refetchMessages } = useQuery({
    queryKey: ["chatbot-messages", threadId, messageCount],
    queryFn: async () => {
      if (messageCount === 0) return null;
      const result = await getMessages(threadId);
      console.log("Messages fetched:", result?.thread?.messages?.length);
      return result;
    },
    refetchOnWindowFocus: false,
    enabled: messageCount > 0 && !!threadId,
  });
  console.log(messagesData, "md");
  const apiMessages = React.useMemo(() => {
    if (messagesData?.thread?.messages) {
      return messagesData.thread.messages;
    }
    return [];
  }, [messagesData]);

  // Send message function
  const sendMessageMutation = async (content: string) => {
    try {
      const response = await sendMessage(threadId, {
        content,
        type: "text",
      });
      console.log("Message sent:", response);
      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  // Handle search bar integration
  React.useEffect(() => {
    if (chatMode && !isOpen) {
      setIsOpen(true);
    }
    setInputValue(message);
  }, [chatMode, message]);

  // Monitor message count changes and stop polling when response received
  React.useEffect(() => {
    if (isWaitingForResponse && messageCount > lastMessageCount) {
      console.log("New message detected, stopping polling");
      console.log(
        "Current count:",
        messageCount,
        "Last count:",
        lastMessageCount
      );

      // Stop polling with a small delay to ensure message is fully processed
      setTimeout(() => {
        setIsWaitingForResponse(false);
        setLastMessageCount(messageCount);
      }, 500);
    }
  }, [messageCount, lastMessageCount, isWaitingForResponse]);

  // Update local messages when API messages change
  React.useEffect(() => {
    if (apiMessages.length > 0) {
      console.log("Updating messages:", apiMessages.length);
      setMessages(apiMessages);
    }
  }, [apiMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addToCart = (item: Product, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, cartQuantity: cartItem.cartQuantity + quantity }
            : cartItem
        );
      }
      return [...prevCart, { ...item, cartQuantity: quantity }];
    });
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isWaitingForResponse) {
      const messageToSend = inputValue.trim();

      // Clear input immediately
      setInputValue("");

      // Store current message count and start polling
      setLastMessageCount(messageCount);
      setIsWaitingForResponse(true);

      console.log("Sending message, current count:", messageCount);

      try {
        await sendMessageMutation(messageToSend);
        console.log("Message sent successfully, waiting for response...");

        // Force refetch messages after a short delay
        setTimeout(() => {
          refetchMessages();
        }, 1000);
      } catch (error) {
        console.error("Failed to send message:", error);
        setIsWaitingForResponse(false);
        setInputValue(messageToSend); // Restore input on error
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleCheckout = () => {
    console.log("Proceeding to checkout with:", cart);
    // Implement checkout logic
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

  console.log("Render state:", {
    messageCount,
    lastMessageCount,
    isWaitingForResponse,
    messagesLength: messages.length,
  });

  // Render user message
  const RenderUserMessage = ({ text }: { text: string }) => {
    return (
      <div className="flex justify-end animate-in slide-in-from-right duration-300">
        <div className="max-w-[80%] bg-[#3D6B2C] text-white rounded-2xl px-4 py-2 shadow-md">
          <div className="flex items-start space-x-2">
            <p className="text-sm">{text}</p>
            <User className="w-4 h-4 mt-1 flex-shrink-0" />
          </div>
        </div>
      </div>
    );
  };

  // Render bot message
  const RenderBotMessage = ({
    text,
    action,
    items,
  }: {
    text: string;
    action: string;
    items: Product[];
  }) => {
    return (
      <div className="flex justify-start animate-in slide-in-from-left duration-300">
        <div className="max-w-[90%] space-y-3">
          <div className="bg-white text-gray-800 border border-gray-200 rounded-2xl px-4 py-2 shadow-sm">
            <div className="flex items-start space-x-2">
              <Bot className="w-4 h-4 mt-1 text-[#3D6B2C] flex-shrink-0" />
              <p className="text-sm">{text}</p>
            </div>
          </div>

          {action === "material_selection" && items && items.length > 0 && (
            <ItemSlider
              items={items}
              onAddToCart={addToCart}
              onCheckout={() => null}
            />
          )}
        </div>
      </div>
    );
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
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative p-1 hover:bg-white/20 rounded transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-[#F08C23] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.cartQuantity, 0)}
                </span>
              </button>
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
            {/* Cart View */}
            {showCart && cart.length > 0 && (
              <div className="p-4">
                <CartView
                  cart={cart}
                  onCheckout={handleCheckout}
                  onClose={() => setShowCart(false)}
                />
              </div>
            )}

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 min-h-0">
              <div className="space-y-4">
                {messages.map((message) => {
                  if (message?.role === "user")
                    return (
                      <RenderUserMessage
                        key={message.id}
                        text={message.content}
                      />
                    );
                  else
                    return (
                      <RenderBotMessage
                        key={message.id}
                        text={message?.content?.content}
                        action={message?.content?.action}
                        items={message?.content?.items}
                      />
                    );
                })}

                {isWaitingForResponse && (
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
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isWaitingForResponse}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3D6B2C] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isWaitingForResponse}
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
          {cart.reduce((sum, item) => sum + item.cartQuantity, 0)}
        </div>
      )}
    </div>
  );
};

export default ChatBot;
