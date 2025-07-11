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
  Package,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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

interface BotResponse {
  action: "greeting" | "material_selection";
  content: string;
  items: Product[];
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string | BotResponse;
  timestamp: number;
}

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
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-4 w-64 flex-shrink-0 transform hover:scale-105">
      <div className="relative h-40 mb-3 overflow-hidden rounded-lg bg-gray-100">
        {item.photo ? (
          <img
            src={item.photo}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>

      <h4 className="font-semibold text-gray-800 mb-1 truncate">{item.name}</h4>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
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

        <button
          onClick={handleAddToCart}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform ${
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
    </div>
  );
};

// Item Slider Component
const ItemSlider: React.FC<{
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

  return (
    <div className="relative mx-2">
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-gray-800/80 hover:bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
      >
        <ChevronLeft size={20} />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide py-4 px-12"
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
const CartView: React.FC<{
  cart: CartItem[];
  onCheckout: () => void;
  onClose: () => void;
}> = ({ cart, onCheckout, onClose }) => {
  const totalItems = cart.reduce((sum, item) => sum + item.cartQuantity, 0);

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
          <span className="font-semibold text-[#3D6B2C]">{totalItems}</span>
        </div>
        <button
          onClick={onCheckout}
          className="w-full py-2 bg-[#F08C23] hover:bg-[#d87a1f] text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

// Main ChatBot Component
const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: {
        action: "greeting",
        content:
          "Hello! Welcome to Keyman. I can help you find construction materials and supplies. What are you looking for today?",
        items: [],
      },
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Add confirmation message
    const confirmMessage: Message = {
      id: Date.now().toString(),
      sender: "bot",
      text: {
        action: "greeting",
        content: `Great! I've added ${quantity} ${item.name} to your cart.`,
        items: [],
      },
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, confirmMessage]);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isLoading) {
      const userMessage: Message = {
        id: Date.now().toString(),
        sender: "user",
        text: inputValue,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsLoading(true);

      // Simulate API call
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: {
            action: "material_selection",
            content:
              "Here are some construction items that might interest you:",
            items: [
              {
                id: "1",
                name: "Cement 50kg",
                description: "High-quality Portland cement for construction",
                photo: "",
                quantity: 100,
              },
              {
                id: "2",
                name: "Steel Rebar 12mm",
                description: "Reinforcement steel bars for concrete structures",
                photo: "",
                quantity: 50,
              },
              {
                id: "3",
                name: "Sand (Fine)",
                description: "Fine sand for plastering and finishing work",
                photo: "",
                quantity: 200,
              },
              {
                id: "4",
                name: "Concrete Blocks",
                description: "Standard concrete blocks for wall construction",
                photo: "",
                quantity: 1000,
              },
            ],
          },
          timestamp: Date.now() + 1000,
        };

        setMessages((prev) => [...prev, botResponse]);
        setIsLoading(false);
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCheckout = () => {
    console.log("Proceeding to checkout with:", cart);
    // Implement checkout logic
    const checkoutMessage: Message = {
      id: Date.now().toString(),
      sender: "bot",
      text: {
        action: "greeting",
        content: `Ready to checkout ${cart.reduce(
          (sum, item) => sum + item.cartQuantity,
          0
        )} items! Redirecting to payment...`,
        items: [],
      },
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, checkoutMessage]);
    setShowCart(false);
  };

  const renderMessage = (message: Message) => {
    if (message.sender === "user") {
      return (
        <div className="flex justify-end animate-in slide-in-from-right duration-300">
          <div className="max-w-[80%] bg-[#3D6B2C] text-white rounded-2xl px-4 py-2 shadow-md">
            <div className="flex items-start space-x-2">
              <p className="text-sm">{message.text as string}</p>
              <User className="w-4 h-4 mt-1 flex-shrink-0" />
            </div>
          </div>
        </div>
      );
    }

    const botText = message.text as BotResponse;
    return (
      <div className="flex justify-start animate-in slide-in-from-left duration-300">
        <div className="max-w-[90%] space-y-3">
          <div className="bg-white text-gray-800 border border-gray-200 rounded-2xl px-4 py-2 shadow-sm">
            <div className="flex items-start space-x-2">
              <Bot className="w-4 h-4 mt-1 text-[#3D6B2C] flex-shrink-0" />
              <p className="text-sm">{botText.content}</p>
            </div>
          </div>

          {botText.action === "material_selection" &&
            botText.items.length > 0 && (
              <ItemSlider items={botText.items} onAddToCart={addToCart} />
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
          absolute bottom-16 right-0 w-[90vw] sm:w-96 bg-white rounded-2xl shadow-2xl
          transform transition-all duration-300 ease-in-out flex flex-col
          ${
            isOpen
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-4 opacity-0 scale-95 pointer-events-none"
          }
          ${isMinimized ? "h-12" : "h-[500px]"}
        `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3D6B2C] to-[#388E3C] text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Keyman Assistant</h3>
              <p className="text-xs opacity-90">Always here to help</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {cart.length > 0 && (
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative p-1 hover:bg-white/20 rounded transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#F08C23] text-white text-xs rounded-full flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.cartQuantity, 0)}
                </span>
              </button>
            )}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Content */}
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

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id}>{renderMessage(message)}</div>
                ))}

                {isLoading && (
                  <div className="flex justify-start animate-pulse">
                    <div className="bg-white text-gray-800 border border-gray-200 rounded-2xl px-4 py-2 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4 text-[#3D6B2C]" />
                        <div className="flex space-x-1">
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
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
                  placeholder="Ask about construction materials..."
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3D6B2C] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="w-10 h-10 bg-[#3D6B2C] hover:bg-[#2d5220] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 bg-gradient-to-r from-[#3D6B2C] to-[#388E3C] text-white rounded-full shadow-lg
          flex items-center justify-center transition-all duration-300 hover:scale-110
          ${isOpen ? "rotate-90" : ""}
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
