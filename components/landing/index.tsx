"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShoppingCart,
  Users,
  Building,
  Hammer,
  CheckCircle,
  Package,
  CreditCard,
  UserPlus,
} from "lucide-react";

import AnimatedHeroSection from "./HeroComponent";
import { getUser, useAppContext } from "@/providers/AppContext";
import { NavigationComponent } from "../ui/Navigation";
import { KeymanSkeleton } from "@/lib/helperComponents";
import { useRouter } from "next/navigation";
import { Image } from "@mantine/core";
//import SuppliersNearMeCTA from "./SuppliersNearMeCT";
import KeymanBanner from "../Banner";
import { getBannerssNearMe } from "@/api/requests";
import { useQuery } from "@tanstack/react-query";
import SuppliersNearMe from "../supplier/SuppliersNearMe";
import ForexRatesBoard from "../wallet/ForexRatesBoard";

// Hero Section Component
const HeroSection: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  return (
    <section
      className={`pt-20 pb-16 px-4 sm:px-6  lg:px-8 ${
        darkMode ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-white"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1
                className={`text-4xl md:text-6xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                } leading-tight`}
              >
                Quality made
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3D6B2C] to-[#4CAF50]">
                  {" "}
                  Affordable
                </span>
              </h1>
              <p
                className={`text-lg md:text-xl ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                } max-w-lg`}
              >
                Connect with trusted construction products and professionals.
                Build your dream project with confidence and ease.
              </p>
            </div>

            <Link
              href="/accounnt/login"
              className=" w-[80%] md:w-60 group bg-gradient-to-r from-[#3D6B2C] to-[#4CAF50] text-white px-8 py-4 rounded-xl font-medium text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <span>Order Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="relative">
            <div
              //className="relative z-10 bg-gradient-to-br from-[#F08C23] to-orange-400 rounded-3xl p-8 transform hover:rotate-1 transition-transform duration-500"
              className="rounded-md w-full h-full overflow-hidden"
            >
              <div>
                <Image
                  src="/keyman_hero.jpeg"
                  alt=""
                  className="rounded-lg h-full w-full object-cover"
                />
              </div>
              <div className="grids grid-cols-2 gap-4 hidden">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center justify-center">
                  <Hammer className="w-12 h-12 text-white" />
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center justify-center">
                  <Package className="w-12 h-12 text-white" />
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center justify-center">
                  <Building className="w-12 h-12 text-white" />
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center justify-center">
                  <Users className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#3D6B2C] to-[#4CAF50] rounded-3xl transform rotate-3 opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Ask Keyman Section Component
export const AskKeymanSection: React.FC<{ darkMode: boolean }> = ({
  darkMode,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section
      className={`py-16 px-4 sm:px-6 lg:px-8 ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h2
            className={`text-3xl md:text-4xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            KEYMAN
          </h2>
          <p
            className={`text-lg ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Your platform for trusted construction products and pros.
          </p>
        </div>

        <div className="space-y-4">
          <h3
            className={`text-xl font-semibold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Ask Keyman
          </h3>

          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What do I need to build a 3 bedroom house?"
              className={`w-full px-6 py-4 pr-16 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3D6B2C] ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-[#3D6B2C] to-[#4CAF50] p-3 rounded-lg hover:shadow-lg transition-all duration-200 group">
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Request Order Section Component
const RequestOrderSection: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  return (
    <section
      className={`py-16 px-4 sm:px-6 lg:px-8 ${
        darkMode
          ? "bg-gray-900"
          : "bg-gradient-to-br from-green-50 to-emerald-50"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2
              className={`text-3xl md:text-4xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Request Your Order
            </h2>
            <p
              className={`text-lg ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Get accurate quotations for your construction projects. Our
              AI-powered system helps you build comprehensive project lists and
              connect with trusted suppliers.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#4CAF50] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span
                  className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Add items to your cart with AI assistance
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#4CAF50] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span
                  className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Get competitive quotes from verified suppliers
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#4CAF50] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span
                  className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Track your project progress in real-time
                </span>
              </div>
            </div>

            <Link
              href="/account/login"
              className=" w-[80%] md:w-60 bg-gradient-to-r from-[#F08C23] to-orange-400 text-white px-8 py-4 rounded-xl font-medium text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Start Your Order</span>
            </Link>
          </div>

          <div className="relative ">
            <div
              className={`${
                darkMode ? "bg-gray-800" : "bg-white"
              } rounded-3xl p-8 shadow-2xl transform hover:rotate-1 transition-transform duration-500`}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-xl font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Project Cart
                  </h3>
                  <div className="w-8 h-8 bg-[#F08C23] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    "Cement bags (50kg)",
                    "Steel bars (12mm)",
                    "Building blocks",
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        darkMode ? "bg-gray-700" : "bg-gray-50"
                      }`}
                    >
                      <span
                        className={`${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {item}
                      </span>
                      <div className="w-6 h-6 bg-[#4CAF50] rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Token System Section Component
const TokenSystemSection: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  return (
    <section
      className={`py-16 px-4 sm:px-6 lg:px-8 ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h2
            className={`text-3xl md:text-4xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Order with Tokens
          </h2>
          <p
            className={`text-lg ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Purchase tokens to place orders seamlessly. Our token system ensures
            secure transactions and priority access to premium suppliers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { tokens: "1", price: "Ksh20", popular: false },
            { tokens: "20", price: "Ksh400", popular: true },
            { tokens: "100", price: "ksh2000", popular: false },
          ].map((plan, index) => (
            <div
              key={index}
              className={`relative ${
                darkMode ? "bg-gray-700" : "bg-gray-50"
              } rounded-2xl p-6 ${
                plan.popular ? "ring-2 ring-[#F08C23] transform scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#F08C23] text-white px-4 py-1 rounded-full text-sm font-medium">
                    Popular
                  </span>
                </div>
              )}
              <div className="space-y-4">
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {plan.tokens}
                  </div>
                  <div className="text-sm text-gray-500">
                    {index === 0 ? "Token" : "Tokens"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#3D6B2C]">
                    {plan.price}
                  </div>
                </div>
                <button
                  className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
                    plan.popular
                      ? "bg-gradient-to-r from-[#F08C23] to-orange-400 text-white hover:shadow-lg"
                      : `${
                          darkMode
                            ? "bg-gray-600 hover:bg-gray-500 text-white"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                        }`
                  }`}
                >
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  Buy Tokens
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Registration Section Component
const RegistrationSection: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  const text = `Whether you're looking to order construction materials or supply them, we've got you covered.`;
  return (
    <section
      className={`py-20 px-4 sm:px-6 lg:px-8 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800"
          : "bg-gradient-to-br from-[#3D6B2C] to-[#4CAF50]"
      }`}
    >
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Join the Keyman Community
          </h2>
          <p className="text-lg text-green-100">{text}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 group">
            <div className="space-y-4 text-white">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">Join as Buyer</h3>
              <p className="text-green-100">
                Order materials, get quotes, and manage your construction
                projects
              </p>
              <Link
                href="/account/sign-up?q=buyer"
                className="w-full bg-white text-[#3D6B2C] py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up as Buyer</span>
              </Link>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 group">
            <div className="space-y-4 text-white">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">Join as Supplier</h3>
              <p className="text-green-100">
                List your products, respond to orders, and grow your business
              </p>
              <Link
                href="/account/sign-up?q=suplier"
                className="w-full bg-[#F08C23] text-white py-3 rounded-lg font-medium hover:bg-orange-500 transition-colors flex items-center justify-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up as Supplier</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Main Landing Page Component
const KeymanLanding: React.FC = () => {
  const { darkMode, user } = useAppContext();
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const { data: _banners } = useQuery({
    queryKey: ["banners_near_me"],
    queryFn: async () =>
      getBannerssNearMe(userLocation?.lat ?? 0, userLocation?.lng ?? 0),
    enabled: !!userLocation,
  });
  // Get user location on component mount
  useEffect(() => {
    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        //setLocationError("Geolocation is not supported by this browser");
        //setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          // setLoading(false);
        },
        (error) => {
          console.log(error);
          /* setLocationError(
            "Unable to retrieve your location. Try again later."
          );*/
          //  setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000,
        }
      );
    };

    getCurrentLocation();
  }, []);

  const banners = React.useMemo(() => {
    if (_banners?.adverts?.length > 0) {
      return _banners?.adverts;
    }
    return [];
  }, [_banners]);
  const createElement = (style: HTMLElement) => {
    style.textContent = `
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fade-in 0.8s ease-out;
      }
    `;
    document.head.appendChild(style);
  };
  // Create and append the style element for animations
  useEffect(() => {
    const style = document.createElement("style");
    createElement(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  // redirect if user is already logged in
  useEffect(() => {
    const _user = getUser();
    if (_user) {
      router.push("/keyman/dashboard");
    }
  }, []);

  if (user)
    return (
      <>
        <NavigationComponent isFixed />
        <div className="pt-18"></div>
        <KeymanSkeleton />
      </>
    );

  return (
    <div
      className={`min-h-screen  transition-colors duration-300 ${
        darkMode ? "bg-gray-900" : "bg-white"
      }`}
    >
      <NavigationComponent isFixed />
      <div className="pt-18"></div>

      <AnimatedHeroSection />
      <ForexRatesBoard />
      <div className="py-4">
        <KeymanBanner banners={banners} />
      </div>
      <SuppliersNearMe url="/suppliers-near-me/" />

      <RegistrationSection darkMode={darkMode} />
      {/** <AskKeymanSection darkMode={darkMode} />*/}
      <HeroSection darkMode={darkMode} />
      <RequestOrderSection darkMode={darkMode} />
      <TokenSystemSection darkMode={darkMode} />
    </div>
  );
};

export default KeymanLanding;
