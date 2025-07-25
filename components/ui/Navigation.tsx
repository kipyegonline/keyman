"use client";
import React, { useState } from "react";
import { Sun, Moon, Menu, X } from "lucide-react";
import Link from "next/link";
import { Text, Image } from "@mantine/core";
import { usePathname } from "next/navigation";
import { useAppContext } from "@/providers/AppContext";
import { useCart } from "@/providers/CartContext";
import { CartButton } from "../supplier/priceList";
/*eslint-disable*/
const checkDash = () => {
  const dashboard = globalThis?.window?.localStorage.getItem("dashboard");
  if (dashboard === null) return true;
  return dashboard === "dashboard";
};
const checkAuth = () => {
  return globalThis?.window?.localStorage.getItem("supplier_id");
};
const getLocalCart = () => {
  const cart = JSON.parse(
    globalThis?.window?.localStorage.getItem("cart") as string
  );

  return cart;
};
const checkGuest = () => {
  return globalThis?.window?.localStorage.getItem("keyman_user");
};
export const NavigationComponent: React.FC<{ isFixed: boolean }> = ({
  isFixed = true,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useAppContext();
  const pathname = usePathname();

  const { cart, setModalOpen } = useCart();
  const [ownsCart, setOwnsCart] = React.useState(false);
  React.useEffect(() => {
    const ownsCart = checkAuth() === getLocalCart()?.supplierId;
    setOwnsCart(ownsCart);
  }, []);
  const isSupplierSide = checkDash();
  const isGuest = !!!checkGuest();
  const isSupplierPath = pathname.startsWith("/supplier");
  const hasAccess = isSupplierPath;

  const paths = [
    "/account/login",
    "/account/sign-up",
    "/account/forgot-password",
    "/account/reset-password",
  ];

  const isAccountPage =
    pathname.startsWith("/supplier") || paths.includes(pathname);

  const Checkout = cart.itemCount > 0 && hasAccess && (
    <CartButton cart={cart} setCartModalOpened={() => setModalOpen(true)} />
  );

  return (
    <nav
      className={` ${
        isFixed ? "fixed" : ""
      }  w-full z-50 transition-all duration-300 px-4  md:px-8 ${
        darkMode ? "bg-gray-900/95" : "bg-white/95"
      } backdrop-blur-md border-b ${
        darkMode ? "border-gray-800" : "border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href={isAccountPage ? "/" : "/keyman/dashboard"}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10  rounded-lg flex items-center justify-center">
              <Image
                src="/keyman_logo.png"
                alt="Keyman Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
            </div>
            <span
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              KEYMAN
            </span>
            <span className="text-sm font-medium text-[#F08C23]">STORES</span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg  hidden transition-colors ${
                darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
            {Checkout}
            {isSupplierPath && isAccountPage && (
              <Text fw={700} size="lg">
                {JSON.parse(localStorage.getItem("keyman_user") ?? "{}")?.name}
              </Text>
            )}
            {isAccountPage ? null : (
              <Link
                href="/account/login"
                className=" border-2 border-keyman-green gradient-to-r from-[#3D6B2C] to-[#4CAF50]  px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Sign in
              </Link>
            )}
            {isAccountPage ? null : (
              <Link
                href="/account/sign-up"
                className="bg-gradient-to-r from-[#3D6B2C] to-[#4CAF50] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Sign Up
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg hidden ${
                darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-lg ${
                darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden " style={{ zIndex: 999 }}>
            <div className="px-2 py-4 space-y-1  w-full  flex justify-end gap-x-4">
              {Checkout}
              {isSupplierPath && isAccountPage && (
                <Text fw={700} size="lg">
                  {
                    JSON.parse(localStorage.getItem("keyman_user") ?? "{}")
                      ?.name
                  }
                </Text>
              )}
              {isAccountPage ? null : (
                <Link
                  href="/account/login"
                  className=" border-2 border-keyman-green gradient-to-r from-[#3D6B2C] to-[#4CAF50]  px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Sign in
                </Link>
              )}
              {isAccountPage ? null : (
                <Link
                  href="/account/sign-up"
                  className="bg-gradient-to-r from-[#3D6B2C] to-[#4CAF50] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
