import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  ShoppingCart,
  Bot,
  User,
} from "lucide-react";
import { Image } from "@mantine/core";
import { useAppContext } from "@/providers/AppContext";
import { useQuery } from "@tanstack/react-query";
import {
  createThread,
  getMessageCount,
  getMessages,
  //getThreads,
  sendMessage,
} from "@/api/chatbot";
import { CartView, ItemSlider } from "./v3";
import { notify } from "@/lib/notifications";
import { getProjects } from "@/api/projects";
import { Project } from "@/types";
import { createRequest } from "@/api/requests";
import { CreateRequestPayload } from "@/types/requests";
/*eslint-disable*/
interface Product {
  description: string;
  id: string;
  name: string;
  photo: string;
  quantity: number;
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

interface CartItem extends Product {
  cartQuantity: number;
  attachImage: boolean;
}
const dash = "dashboard";
const checkDash = () => {
  const _dash = globalThis?.window?.localStorage.getItem("dashboard");
  if (_dash === null) return true;
  return _dash === dash;
};
const checkAuth = () => {
  const user = globalThis?.window?.localStorage.getItem("keyman_user");
  return !!user;
};
const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [expectedMessageCount, setExpectedMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [checkoutSpinner, setCheckoutSpinner] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const { chatMode, message } = useAppContext();
  const isLoggedIn = checkAuth();
  const isMainDashboard = checkDash();
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [KSNumber, setKSNumber] = useState("");

  // Get thread ID
  const { data: locations, refetch: refreshLocation } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => await getProjects(),
    enabled: isLoggedIn && isMainDashboard,
  });

  // Get thread ID
  const { data: threadData } = useQuery({
    queryKey: ["chatbot-threads"],
    queryFn: async () => await createThread(),
  });

  const threadId = React.useMemo(() => {
    if (threadData?.thread) return threadData.thread.id;
    return "";
  }, [threadData]);

  // Get message count with polling when waiting for response
  const { data: messageCountData } = useQuery({
    queryKey: ["chatbot-message-count", threadId],
    queryFn: async () => await getMessageCount(threadId),
    refetchOnWindowFocus: false,
    enabled: !!threadId,
    refetchInterval: isWaitingForResponse ? 1000 : false,
    refetchIntervalInBackground: false,
  });

  const messageCount = React.useMemo(() => {
    if (messageCountData?.count) return messageCountData.count;
    return 0;
  }, [messageCountData]);

  // Get messages when message count changes
  const { data: messagesData } = useQuery({
    queryKey: ["chatbot-messages", threadId, messageCount],
    queryFn: async () => await getMessages(threadId),
    refetchOnWindowFocus: false,
    enabled: messageCount > 0 && !!threadId,
  });

  const apiMessages = React.useMemo(() => {
    if (messagesData?.thread) {
      return messagesData.thread?.messages || [];
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
    setShowCart(false);

    handleSendMessage();
  }, [chatMode]);

  // Monitor message count changes when waiting for response
  React.useEffect(() => {
    if (isWaitingForResponse && messageCount >= expectedMessageCount) {
      setIsWaitingForResponse(false);
      setExpectedMessageCount(0);
    }
  }, [messageCount, expectedMessageCount, isWaitingForResponse]);

  // Update local messages when API messages change
  React.useEffect(() => {
    // Check if we should auto-scroll (user is near bottom)
    if (messagesContainerRef.current && shouldAutoScroll) {
      const container = messagesContainerRef.current;
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;
      setShouldAutoScroll(isNearBottom);
    }
  }, [apiMessages]);

  // Auto-scroll effect - only scroll when appropriate
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      });
    }
  }, [apiMessages, shouldAutoScroll]);

  // Handle scroll events to detect if user scrolled up
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        50;
      setShouldAutoScroll(isAtBottom);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      setShouldAutoScroll(true);
    }
  };
  const imageRequired = (required: boolean) => (required ? 1 : 0);

  const addToCart = (item: Product, quantity: number, attachImage: boolean) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                cartQuantity: cartItem.cartQuantity + quantity,
                attachImage,
              }
            : cartItem
        );
      }
      return [...prevCart, { ...item, cartQuantity: quantity, attachImage }];
    });
  };

  const updateCart = (
    item: Product,
    newQuantity: number,
    attachImage: boolean
  ) => {
    setCart((prevCart) => {
      if (newQuantity === 0) {
        // Remove item from cart
        return prevCart.filter((cartItem) => cartItem.id !== item.id);
      }
      // Update quantity
      return prevCart.map((cartItem) =>
        cartItem.id === item.id
          ? {
              ...cartItem,
              cartQuantity: newQuantity,
              attachImage,
            }
          : cartItem
      );
    });
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isWaitingForResponse) {
      const messageToSend = inputValue.trim();
      setInputValue("");
      setExpectedMessageCount(messageCount + 2);
      setIsWaitingForResponse(true);

      // Ensure we auto-scroll for new user messages
      setShouldAutoScroll(true);

      try {
        await sendMessageMutation(messageToSend);
      } catch (error) {
        console.error("Failed to send message:", error);
        setIsWaitingForResponse(false);
        setExpectedMessageCount(0);
        setInputValue(messageToSend);
      }
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

  const resetState = () => {
    setCart([]);
    setKSNumber("");
    setDate("");
    setLocation("");
    setShowCart(false);
  };

  const handleCreateRequest = async () => {
    const selectedLocation = locations?.projects?.find(
      (loc: Project) => loc.id === location
    );
    const items = cart.map((cartItem) => ({
      ...cartItem,
      item_id: cartItem.id,
      description: "",
      visual_confirmation_required: imageRequired(cartItem.attachImage),
    }));

    if (!selectedLocation) {
      notify.error("Looks like you did not add a delivery location ");
      return;
    }

    const [lng, ltd] = selectedLocation?.location?.coordinates;

    for (const item of items) {
      if ("photo" in item) {
        //@ts-expect-error
        delete item?.["photo"];
      }
    }

    const payload: CreateRequestPayload = {
      status: "SUBMITTED",
      delivery_date: date ?? "",
      latitude: ltd,
      longitude: lng,
      ks_number: KSNumber,
      created_from: "items",
      //@ts-expect-error
      items,
    };

    setCheckoutSpinner(true);

    try {
      const response = await createRequest(payload);

      if (response.status) {
        notify.success("Request created successfully");
        resetState();
      } else {
        notify.error("Something went wrong. Try again later.");
      }
    } catch (err) {
      notify.error("Failed to submit request. Please try again.");
      console.log(err);
    } finally {
      setCheckoutSpinner(false);
    }
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      notify.error("Please login to continue", "Login");
      return;
    }
    if (!isMainDashboard) {
      notify.error("Please checkout from your user dashboard");
      return;
    }
    setCheckoutSpinner(true);
    setTimeout(() => {
      setCheckoutSpinner(false);
    }, 3000);
  };

  // Render user message
  const RenderUserMessage = ({ text }: { text: string }) => {
    return (
      <div className="flex justify-end animate-in slide-in-from-right duration-300">
        <div className="max-w-[85%] bg-[#3D6B2C] text-white rounded-2xl px-4 py-2 shadow-md">
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
        <div className="max-w-[100%] space-y-3">
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
              cartItems={cart}
              onUpdateCart={updateCart}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed bottom-4 right-4  " style={{ zIndex: 999 }}>
      {/* Chat Window */}
      <div
        className={`
          absolute bottom-16 right-0  
          w-80 sm:w-96 md:w-[420px] lg:w-[480px] xl:w-[520px]
          max-w-[calc(100vw-2rem)]
          max-h-[85vh] sm:max-h-[80vh] md:max-h-[75vh] lg:max-h-[70vh]
          bg-white rounded-2xl shadow-2xl
          transform transition-all duration-300 ease-in-out flex flex-col
          ${
            isOpen
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-4 opacity-0 scale-95 pointer-events-none"
          }
          ${
            isMinimized
              ? "h-12"
              : "h-[min(600px,85vh)] sm:h-[min(550px,80vh)] md:h-[min(500px,75vh)] lg:h-[min(450px,70vh)]"
          }
        `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3D6B2C] to-[#388E3C] text-white p-4 rounded-t-2xl flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div>
              <Image
                alt=""
                src="/keyman_logo.png"
                className="w-8 h-8 rounded-full shadow-lg"
              />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base">
                Keyman Assistant
              </h3>
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
                  {cart.length}
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
          <div className="p-2 flex-shrink-0">
            <button
              onClick={restoreChatbot}
              className="text-[#3D6B2C] hover:text-[#2d5220] text-sm font-medium"
            >
              Click to restore chat
            </button>
          </div>
        )}

        {/* Main Content Area */}
        {!isMinimized && (
          <>
            {showCart && cart.length > 0 ? (
              /* Cart View - Takes full height when shown */
              <div className="flex-1 overflow-y-auto min-h-0">
                <CartView
                  cart={cart}
                  onClose={() => setShowCart(false)}
                  onCheckout={handleCheckout}
                  locations={locations?.projects ?? []}
                  authInfo={{
                    isLoggedIn: isLoggedIn,
                    isMainDashboard,
                    spinner: checkoutSpinner,
                    isValid: !!date && !!location,
                    date,
                  }}
                  sendLocation={(location) => setLocation(location)}
                  sendDate={(date) => setDate(date)}
                  locationConfig={{
                    location,
                    refresh: () => refreshLocation(),
                  }}
                  KSNumber={KSNumber}
                  setKSNumber={setKSNumber}
                  onCreateRequest={handleCreateRequest}
                />
              </div>
            ) : (
              /* Messages Container - Takes full height when cart not shown */
              <div className="flex-1 p-3 sm:p-4 overflow-y-auto bg-gray-50 min-h-0">
                <div className="space-y-3 sm:space-y-4">
                  {apiMessages.length > 0 &&
                    apiMessages.map((message: Message) => {
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

                  {cart.length > 0 && !isWaitingForResponse && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowCart(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F08C23] hover:bg-[#d87a1f] text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 text-xs"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        Checkout ({cart.length})
                      </button>
                    </div>
                  )}

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
            )}

            {/* Input Area - Fixed at bottom */}
            <div className="flex-shrink-1 sm:flex-shrink-0 p-3  sm:p-4 bg-white border-t border-gray-200 rounded-b-2xl">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isWaitingForResponse}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3D6B2C] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isWaitingForResponse}
                  className="bg-[#3D6B2C] hover:bg-[#2d5220] disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-colors transform hover:scale-105 flex-shrink-0"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
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
          w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-[#3D6B2C] to-[#388E3C] text-white rounded-full shadow-lg
          flex items-center justify-center transition-all duration-300 hover:scale-110
          ${isOpen ? "rotate-90" : "rotate-0"}
        `}
      >
        {isOpen ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        )}
      </button>

      {/* Notification Badge */}
      {!isOpen && cart.length > 0 && (
        <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-[#F08C23] text-white text-xs rounded-full flex items-center justify-center animate-pulse">
          {cart.length}
        </div>
      )}
    </div>
  );
};

export default ChatBot;
