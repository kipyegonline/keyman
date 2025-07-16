"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { notify } from "@/lib/notifications"; // Adjust import path as needed

// Types
export interface ICartItem {
  id: string;
  name: string;
  swahili_name: string;
  price: number;
  type: "goods" | "services" | "professional_services";
  transportation_type: "TUKTUK" | "PICKUP" | "LORRY";
  weight_in_kgs: number;
  description: string;
  image?: string;
  photo?: string[];
  item?: { photo: string[] };
  isUserOwned?: boolean;
  item_id?: string;
  added_by_supplier_id?: string;
  quantity: number;
  addedAt: Date;
}

export interface ICartState {
  items: ICartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  supplierId: string;
}

export interface CartContextType {
  // State
  cart: ICartState;
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Actions
  addToCart: (item: ICartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;

  // Utilities
  isItemInCart: (itemId: string) => boolean;
  getItemQuantity: (itemId: string) => number;
  getCartTotal: () => number;
  getItemCount: () => number;

  // Checkout
  checkout: () => Promise<void>;
}

// Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Custom hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Cart Provider Component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<ICartState>({
    items: [],
    total: 0,
    itemCount: 0,
    isLoading: false,
    supplierId: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  // Helper functions
  const calculateCartTotal = (items: ICartItem[]): number => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateItemCount = (items: ICartItem[]): number => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const updateCartState = (items: ICartItem[]) => {
    setCart((prev) => ({
      ...prev,
      items,
      total: calculateCartTotal(items),
      itemCount: calculateItemCount(items),
    }));
  };

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Convert addedAt back to Date objects
        const itemsWithDates = parsedCart.items.map((item: ICartItem) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        }));
        updateCartState(itemsWithDates);
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
        localStorage.removeItem("cart");
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.items.length > 0) {
      localStorage.setItem(
        "cart",
        JSON.stringify({
          items: cart.items,
          total: cart.total,
          itemCount: cart.itemCount,
          supplierId:
            globalThis?.window?.localStorage.getItem("supplier_id") ?? "",
        })
      );
    } else {
      localStorage.removeItem("cart");
    }
  }, [cart.items, cart.total, cart.itemCount]);

  // Cart Actions
  const addToCart = (item: ICartItem) => {
    const existingItem = cart.items.find((cartItem) => cartItem.id === item.id);

    let updatedItems: ICartItem[];

    if (existingItem) {
      // If item exists, increase quantity
      updatedItems = cart.items.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
      notify.success(`${item.name} quantity updated in cart!`);
    } else {
      // If item doesn't exist, add new item
      const newCartItem: ICartItem = {
        id: item.id,
        name: item.name,
        swahili_name: item.swahili_name,
        price: item.price,
        type: item.type,
        transportation_type: item.transportation_type,
        weight_in_kgs: item.weight_in_kgs,
        description: item.description,
        image: item.image,
        photo: item.photo,
        item: item.item,
        isUserOwned: item.isUserOwned,
        item_id: item.item_id,
        added_by_supplier_id: item.added_by_supplier_id,
        quantity: 1,
        addedAt: new Date(),
      };
      updatedItems = [...cart.items, newCartItem];
      notify.success(`${item.name} added to cart!`);
    }

    updateCartState(updatedItems);
  };

  const removeFromCart = (itemId: string) => {
    const item = cart.items.find((cartItem) => cartItem.id === itemId);
    const updatedItems = cart.items.filter(
      (cartItem) => cartItem.id !== itemId
    );
    updateCartState(updatedItems);

    if (item) {
      notify.success(`${item.name} removed from cart!`);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const updatedItems = cart.items.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );

    updateCartState(updatedItems);
  };

  const clearCart = () => {
    setCart({
      items: [],
      total: 0,
      itemCount: 0,
      isLoading: false,
      supplierId: "",
    });
    notify.success("Cart cleared!");
  };

  // Utility functions
  const isItemInCart = (itemId: string): boolean => {
    return cart.items.some((cartItem) => cartItem.id === itemId);
  };

  const getItemQuantity = (itemId: string): number => {
    const cartItem = cart.items.find((item) => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const getCartTotal = (): number => {
    return cart.total;
  };

  const getItemCount = (): number => {
    return cart.itemCount;
  };

  // Checkout function
  const checkout = async (): Promise<void> => {
    if (cart.items.length === 0) {
      notify.error("Your cart is empty!");
      return;
    }

    setCart((prev) => ({ ...prev, isLoading: true }));

    try {
      // Here you would typically send the cart data to your backend
      // For now, we'll simulate an API call

      const orderData = {
        items: cart.items,
        total: cart.total,
        itemCount: cart.itemCount,
        timestamp: new Date().toISOString(),
      };

      console.log("Processing checkout:", orderData);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Here you would make your actual API call:
      // const response = await fetch('/api/checkout', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(orderData),
      // });

      // For demo purposes, we'll assume success
      notify.success("Order placed successfully!");

      // Clear cart after successful checkout
      setCart({
        items: [],
        total: 0,
        itemCount: 0,
        isLoading: false,
        supplierId: "",
      });
    } catch (error) {
      console.error("Checkout error:", error);
      notify.error("Checkout failed. Please try again.");
      setCart((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Context value
  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isItemInCart,
    getItemQuantity,
    getCartTotal,
    getItemCount,
    checkout,
    modalOpen,
    setModalOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
