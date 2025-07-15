import React, { useState, useRef } from "react";
import {
  X,
  Plus,
  Minus,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Box,
  ArrowLeftRight,
  Key,
  Edit3,
} from "lucide-react";
import { Alert, Badge, Card, Checkbox, Text, TextInput } from "@mantine/core";

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
  attachImage: boolean;
}

// Item Component
const ItemCard: React.FC<{
  item: Product;
  onAddToCart: (item: Product, quantity: number, attachImage: boolean) => void;
  cartItems: CartItem[];
  onUpdateCart?: (
    item: Product,
    newQuantity: number,
    attachImage: boolean
  ) => void;
}> = ({ item, onAddToCart, cartItems, onUpdateCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [attachImage, setAttachImage] = useState(false);
  // Check if item is in cart
  const cartItem = cartItems.find((cartItem) => cartItem.id === item.id);
  const isInCart = !!cartItem;
  const cartQuantity = cartItem?.cartQuantity || 0;
  React.useEffect(() => {
    if (cartItem?.attachImage) {
      setAttachImage(true);
    }
  }, [cartItem?.attachImage]);

  const handleQuantityChange = (delta: number) => {
    if (isEditing && cartItem) {
      // When editing cart item
      const newQuantity = Math.max(0, cartQuantity + delta);
      if (newQuantity === 0) {
        onUpdateCart?.(item, 0, attachImage); // Remove from cart
        setIsEditing(false);
      } else {
        onUpdateCart?.(item, newQuantity, attachImage);
      }
    } else {
      // When setting new quantity to add
      setQuantity(Math.max(1, quantity + delta));
    }
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    onAddToCart(item, quantity, attachImage);
    setTimeout(() => {
      setIsAdding(false);
      setQuantity(1);
    }, 500);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-3 sm:p-4 w-36 sm:w-40 md:w-44 lg:w-48 flex-shrink-0 transform hover:scale-105">
      <div className="relative h-16 sm:h-20 mb-3 hidden overflow-hidden rounded-lg bg-gray-100"></div>

      {/* Item name with title attribute */}
      <h4
        className="font-semibold text-gray-800 mb-4 truncate text-sm sm:text-base"
        title={item.name}
      >
        <Box className="mr-2 inline-block w-3 h-3 sm:w-4 sm:h-4" />
        {item.name}
      </h4>
      <Alert variant="light">
        <Checkbox
          label="I want supplier item image"
          color="green"
          variant="filled"
          size="sm"
          className="!text-xs"
          mb="sm"
          onChange={(event) => setAttachImage(event.currentTarget.checked)}
          checked={attachImage}
        />{" "}
      </Alert>

      {/* Conditional rendering based on cart status and edit mode */}
      {!isInCart ? (
        /* STATE 1: Item NOT in cart - Show initial UI */
        <div className="space-y-3">
          {/* Quantity selector */}
          <div className="flex items-center justify-center space-x-2">
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

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            className={`w-full py-2 rounded-lg font-medium transition-all duration-300 transform text-sm ${
              isAdding
                ? "bg-green-500 text-white scale-95"
                : "bg-[#3D6B2C] hover:bg-[#2d5220] text-white hover:scale-105"
            }`}
          >
            {isAdding ? (
              <div className="flex items-center justify-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                Added!
              </div>
            ) : (
              "Add"
            )}
          </button>
        </div>
      ) : !isEditing ? (
        /* STATE 2: Item IN cart but NOT editing - Show "Added to cart" status */
        <div className="space-y-3">
          {/* Added to cart indicator */}
          <div className="flex items-center justify-center py-3 px-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <div className="text-center">
              <span className="text-sm text-green-700 font-medium block">
                Added to cart
              </span>
              <span className="text-xs text-green-600">
                Qty: {cartQuantity}
              </span>
            </div>
          </div>

          {/* Edit button */}
          <button
            onClick={handleEditToggle}
            className="w-full py-2 bg-keyman-orange  text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 text-sm flex items-center justify-center"
          >
            <Edit3 className="w-4 h-4 mr-1" />
            Edit
          </button>
        </div>
      ) : (
        /* STATE 3: Item IN cart and EDITING - Show edit interface */
        <div className="space-y-3">
          {/* Edit mode quantity controls */}
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="font-medium text-gray-700 w-8 text-center">
              {cartQuantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 text-green-600 flex items-center justify-center transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Done/Update button */}
          <button
            onClick={handleEditToggle}
            className="w-full py-2 bg-[#3D6B2C] hover:bg-[#2d5220] text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 text-sm"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};

// Item Slider Component
export const ItemSlider: React.FC<{
  items: Product[];
  onAddToCart: (item: Product, quantity: number, attachImage: boolean) => void;
  cartItems?: CartItem[];
  onUpdateCart?: (
    item: Product,
    newQuantity: number,
    attachImage: boolean
  ) => void;
}> = ({ items, onAddToCart, cartItems = [], onUpdateCart }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Calculate how many items are visible at once based on screen size
  const getItemsPerView = () => {
    if (typeof window === "undefined") return 3;
    const width = window.innerWidth;
    if (width >= 1024) return 4; // lg screens
    if (width >= 768) return 3; // md screens
    if (width >= 640) return 2; // sm screens
    return 2; // mobile
  };

  const itemsPerView = getItemsPerView();
  const totalSlides = Math.ceil(items.length / itemsPerView);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      // Responsive scroll amount based on screen size
      const scrollAmount =
        window.innerWidth >= 1024
          ? 400
          : window.innerWidth >= 768
          ? 350
          : window.innerWidth >= 640
          ? 300
          : 250;

      const newScrollLeft =
        scrollRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });

      // Update current index based on scroll position
      setTimeout(() => updateCurrentIndex(), 300);
    }
  };

  const updateCurrentIndex = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const containerWidth = scrollRef.current.clientWidth;
      const newIndex = Math.round(scrollLeft / containerWidth);
      setCurrentIndex(Math.min(newIndex, totalSlides - 1));
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const containerWidth = scrollRef.current.clientWidth;
      const scrollAmount = index * containerWidth;

      scrollRef.current.scrollTo({
        left: scrollAmount,
        behavior: "smooth",
      });

      setCurrentIndex(index);
    }
  };

  // Handle scroll events to update indicators
  const handleScroll = () => {
    updateCurrentIndex();
  };

  React.useEffect(() => {
    const handleResize = () => {
      updateCurrentIndex();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <div className="relative w-full">
      <Badge variant="filled" color="orange" size="xs" className="mb-2">
        {items?.length} items available
      </Badge>

      {/* Left scroll button */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-gray-800/80 hover:bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
        disabled={currentIndex === 0}
        style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}
      >
        <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
      </button>

      {/* Items container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-hide py-3 sm:py-4 px-3 sm:px-4 w-full"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          scrollSnapType: "x mandatory",
        }}
      >
        {items.map((item) => (
          <div key={item.id} style={{ scrollSnapAlign: "start" }}>
            <ItemCard
              item={item}
              onAddToCart={onAddToCart}
              cartItems={cartItems}
              onUpdateCart={onUpdateCart}
            />
          </div>
        ))}
      </div>

      {/* Right scroll button */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-gray-800/80 hover:bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
        disabled={currentIndex >= totalSlides - 1}
        style={{ opacity: currentIndex >= totalSlides - 1 ? 0.5 : 1 }}
      >
        <ChevronRight size={16} className="sm:w-5 sm:h-5" />
      </button>

      {/* Slider Indicators */}
      {totalSlides > 1 && (
        <div className="flex justify-center mt-3 space-x-2">
          {Array.from({ length: totalSlides }, (_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-[#F08C23] w-6"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
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
  const checkoutSection = (
    <div>
      <div className="py-2">
        <DeliveryDate sendDate={sendDate} date={authInfo.date} />
      </div>
      <DeliveryLocation
        locations={locations}
        sendLocation={sendLocation}
        config={locationConfig}
      />
      <TextInput
        label="KS number (optional)"
        py="sm"
        value={KSNumber}
        onChange={(e) => setKSNumber(e.target.value)}
      />
    </div>
  );

  const supplierSection = (
    <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 py-2 mb-2">
      <div className="text-center">
        <Text className="text-gray-600" size="xs">
          You need to create this request from customer dashboard
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
    <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 py-2 mb-2">
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
    <div className="bg-white h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800 text-lg">Your Cart</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Cart Items - Scrollable */}
      <div className="flex-1  mb-4">
        <div className="space-y-3">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <span className="text-gray-700 font-medium text-sm">
                  {item.name}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Quantity: {item.cartQuantity}
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium ml-2">
                {item.cartQuantity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Summary & Actions */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium text-gray-700">Total Items:</span>
          <span className="font-semibold text-[#3D6B2C] text-lg">
            {cart.length}
          </span>
        </div>

        {/* Auth/Checkout sections */}
        <div className="mb-4">
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

        {/* Action Button */}
        {!authInfo.isValid ? (
          <div>
            <button
              onClick={onCheckout}
              disabled={authInfo.spinner}
              className="w-full py-3 bg-[#F08C23] hover:bg-[#d87a1f] inline-block text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 text-sm"
            >
              {authInfo.spinner ? "Preparing checkout..." : "Checkout"}
            </button>
            <div className="flex justify-end">
              <small
                onClick={onClose}
                className="text-end cursor-pointer w-full text-gray-400 py-2 "
              >
                Continue adding items to cart
              </small>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onCreateRequest()}
            disabled={authInfo.spinner}
            className="w-full py-3 bg-[#F08C23] hover:bg-[#d87a1f] text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 text-sm"
          >
            {authInfo.spinner ? "Submitting Request..." : "Create Request"}
          </button>
        )}
      </div>
    </div>
  );
};
