"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Building2,
  ShoppingCart,
  CheckCircle2,
  Plug,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Modal, TextInput, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useAppContext } from "@/providers/AppContext";
//import DashboardSearch from "../keyman-bot/DashboardSearch";

const AnimatedHeroSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  // darkMode kept for when AskKeymanSection is re-enabled
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { darkMode } = useAppContext();
  useEffect(() => {
    setIsVisible(true);

    // Add custom animations to document head
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-50px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(50px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
          transform: translateY(0);
        }
        40% {
          transform: translateY(-10px);
        }
        60% {
          transform: translateY(-5px);
        }
      }
      
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(240, 140, 35, 0.7);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(240, 140, 35, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(240, 140, 35, 0);
        }
      }
      
      @keyframes shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
      
      .animate-slideInLeft {
        animation: slideInLeft 0.8s ease-out;
      }
      
      .animate-slideInRight {
        animation: slideInRight 0.8s ease-out 0.2s both;
      }
      
      .animate-fadeInUp {
        animation: fadeInUp 0.6s ease-out;
      }
      
      .animate-bounce-slow {
        animation: bounce 2s infinite;
      }
      
      .animate-pulse-custom {
        animation: pulse 2s infinite;
      }
      
      .shimmer-effect {
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
      }
      
      .text-gradient {
        background: linear-gradient(135deg, #3D6B2C, #4CAF50, #F08C23);
        background-size: 200% 200%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: shimmer 3s ease-in-out infinite;
      }
      
      .floating-animation {
        animation: bounce 3s ease-in-out infinite;
      }
      
      .parallax-element {
        transition: transform 0.1s ease-out;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setMousePosition({ x, y });
  };

  return (
    <section className="relative mb-2 md:mb-4 lg:mb-0 bg-gradient-to-br from-gray-50 via-white to-orange-50 overflow-hidden ">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-[#3D6B2C]/10 to-[#4CAF50]/10 rounded-full blur-3xl floating-animation"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-[#F08C23]/10 to-orange-300/10 rounded-full blur-3xl floating-animation"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-200/5 to-purple-200/5 rounded-full blur-3xl floating-animation"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 lg:py-2 lg:min-h-[55vh] grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          {/* Left Content Section */}
          <div
            className={`space-y-6 lg:space-y-8 ${
              isVisible ? "animate-slideInLeft" : "opacity-0"
            }`}
            onMouseMove={handleMouseMove}
          >
            {/* Logo Section */}
            <div className=" items-center space-x-3 group hidden">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-[#3D6B2C] to-[#4CAF50] rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#3D6B2C] to-[#4CAF50] rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">KEYMAN</div>
                <div className="text-sm font-medium text-[#F08C23] -mt-1">
                  STORES
                </div>
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <div className="relative">
                <h1 className="text-4xl sm:text-5xl lg:text-5xl font-bold leading-tight">
                  <div className="text-gradient mb-2">BUY SAFE.</div>
                  <div className="text-gradient">BUILD SMART.</div>
                </h1>

                {/* Floating Icons */}
                <div
                  className="absolute -right-4 top-4 parallax-element  "
                  style={{
                    transform: `translate(${mousePosition.x * 0.5}px, ${
                      mousePosition.y * 0.5
                    }px)`,
                  }}
                >
                  <Sparkles className="w-6 h-6 text-[#F08C23] animate-bounce-slow hidden" />
                </div>

                <div
                  className="absolute -left-8 bottom-4 parallax-element"
                  style={{
                    transform: `translate(${mousePosition.x * -0.3}px, ${
                      mousePosition.y * -0.3
                    }px)`,
                  }}
                >
                  <Zap
                    className="w-5 h-5 text-[#4CAF50] floating-animation"
                    style={{ animationDelay: "0.5s" }}
                  />
                </div>
              </div>

              {/* Description */}
              <p
                className={`text-lg sm:text-xl text-gray-600 max-w-lg leading-relaxed ${
                  isVisible ? "animate-fadeInUp" : "opacity-0"
                }`}
                style={{ animationDelay: "0.3s" }}
              >
                Trade with verified suppliers. Pay through secure escrow. Build
                with confidence.
              </p>
            </div>

            {/* Call to Action Button */}
            <div
              className={`${isVisible ? "animate-fadeInUp" : "opacity-0"}`}
              style={{ animationDelay: "0.6s" }}
            >
              <button
                className="group relative bg-gradient-to-r from-[#F08C23] to-orange-400 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-pulse-custom overflow-hidden"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <Link
                  href={`/account/login`}
                  className="relative flex items-center space-x-3 cursor-pointer"
                  role="button"
                >
                  <ShoppingCart
                    className={`w-6 h-6 transition-transform duration-300 ${
                      isHovering ? "rotate-12 scale-110" : ""
                    }`}
                  />
                  <span>Start Building Safely</span>
                  <ArrowRight
                    className={`w-6 h-6 transition-transform duration-300 ${
                      isHovering ? "translate-x-2" : ""
                    }`}
                  />
                </Link>
              </button>

              {/* Additional Info */}
              <p className="text-sm text-gray-500 mt-3 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Join 1,000+ satisfied builders</span>
              </p>
            </div>

            {/* Stats or Features 
            <div
              className={`grid grid-cols-3 gap-4 pt-8 ${
                isVisible ? "animate-fadeInUp" : "opacity-0"
              }`}
              style={{ animationDelay: "0.9s" }}
            >
              {[
                { number: "500+", label: "Products" },
                { number: "100+", label: "Suppliers" },
                { number: "24/7", label: "Support" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="text-center group hover:scale-105 transition-transform duration-200"
                >
                  <div className="text-2xl sm:text-3xl font-bold text-[#3D6B2C] group-hover:text-[#F08C23] transition-colors">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
            */}
          </div>

          {/* Right Image Section */}
          <div
            className={`relative  ${
              isVisible ? "animate-slideInRight" : "opacity-0"
            }`}
          >
            {/* Floating sparkle — hidden on mobile to avoid overlapping cards */}
            <div
              className="absolute left-1/2 top-4 parallax-element hidden sm:block"
              style={{
                transform: `translate(${mousePosition.x * 0.5}px, ${
                  mousePosition.y * 0.5
                }px)`,
              }}
            >
              <Sparkles className="w-6 h-6 text-[#F08C23] animate-bounce-slow " />
            </div>
            {/*  <AskKeymanSection darkMode={darkMode} compact />*/}

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 sm:mt-6 lg:mt-3 pb-4 lg:pb-0">
              <WhatIsKeymanStoreCard />
              <KeymanPlugCard />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          className="w-full h-16 sm:h-20 lg:h-12 fill-white"
        >
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default AnimatedHeroSection;

// Ask Keyman Section Component — kept ready for re-use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AskKeymanSection: React.FC<{ darkMode: boolean; compact?: boolean }> = ({
  darkMode,
  compact = false,
}) => {
  const router = useRouter();
  const cardStyles = "rounded-2xl shadow-xl";

  const handleSearch = () => {
    router.push(`/suppliers-near-me`);
  };

  return (
    <section
      className={`${
        compact ? "py-5 px-5" : "py-16 px-4 sm:px-6 lg:px-8"
      } ${cardStyles} ${darkMode ? "bg-gray-800" : "bg-white"}`}
    >
      <div className="max-w-6xl mx-auto text-center space-y-2">
        <div className="space-y-1">
          <h2
            className={`${
              compact ? "text-xl" : "text-3xl md:text-4xl"
            } font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            } text-transparent bg-clip-text bg-gradient-to-r from-[#3D6B2C] to-[#4CAF50]`}
          >
            KEYMAN
          </h2>
          {!compact && (
            <p
              className={`text-lg ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Your platform for trusted construction products and pros.
            </p>
          )}
        </div>

        <div className="space-y-2">
          {!compact && (
            <h3
              className={`text-xl font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Ask Keyman
            </h3>
          )}

          <div className="relative max-w-2xl mx-auto">
            <div className="flex justify-center">
              <Button
                onClick={handleSearch}
                size={compact ? "sm" : "lg"}
                radius="md"
                className="bg-gradient-to-r from-[#3D6B2C] to-[#4CAF50] hover:shadow-lg transition-all duration-200"
                rightSection={<ArrowRight className="w-4 h-4" />}
              >
                Search Suppliers
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Green card: What Is a Keyman Store?
const WhatIsKeymanStoreCard: React.FC = () => {
  const features = [
    "A unique KS Number",
    "A public profile",
    "Verified badge option",
    "Secure payment access",
    "Reputation history",
    "Ability to receive orders safely",
  ];
  const storeTypes = [
    "A hardware shop",
    "A fundi (plumber, mason, electrician, painter)",
    "A professional (engineer, architect, QS, surveyor)",
    "A supplier or manufacturer",
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#3D6B2C] to-[#4CAF50] p-4 text-white shadow-lg flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-1">
        <Building2 className="w-5 h-5 flex-shrink-0" />
        <span className="font-bold text-sm leading-tight">
          What Is a Keyman Store?
        </span>
      </div>
      <p className="text-xs text-green-100 leading-relaxed">
        Your digital business space on KeymanStores. It can be:
      </p>
      <ul className="text-xs text-green-100 space-y-0.5 mb-1">
        {storeTypes.map((t) => (
          <li key={t} className="flex items-start gap-1">
            <span className="mt-0.5 text-green-300">•</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs font-semibold text-white">Your store has:</p>
      <ul className="text-xs text-green-100 space-y-0.5">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-green-300" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Orange card: Become a Keyman Plug
const KeymanPlugCard: React.FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent("Join as a Keyman Plug");
    const body = encodeURIComponent(
      `Name: ${name}\nPhone: ${phone}\nEmail: ${email}`,
    );
    window.open(`mailto:info@keymanstores.com?subject=${subject}&body=${body}`);
    setSubmitted(true);
  };

  const perks = [
    "Work from your phone",
    "No capital required",
    "Earn commission per verified store",
    "Be part of Kenya's trusted construction network",
  ];

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => {
          close();
          setSubmitted(false);
        }}
        title={
          <span className="font-bold text-[#F08C23]">
            💼 Join as a Keyman Plug
          </span>
        }
        centered
        radius="md"
      >
        {submitted ? (
          <Stack align="center" py="md" gap="sm">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <Text fw={600} ta="center">
              Your email client has been opened!
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Send the email to complete your application. We&apos;ll reach out
              to you shortly.
            </Text>
            <Button
              variant="light"
              color="orange"
              onClick={() => {
                close();
                setSubmitted(false);
              }}
            >
              Done
            </Button>
          </Stack>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack gap="sm">
              <Text size="sm" c="dimmed">
                Fill in your details and we&apos;ll contact you to get you
                started.
              </Text>
              <TextInput
                label="Full Name"
                placeholder="e.g. Jane Mwangi"
                required
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                radius="md"
              />
              <TextInput
                label="Phone Number"
                placeholder="e.g. 0712 345 678"
                required
                value={phone}
                onChange={(e) => setPhone(e.currentTarget.value)}
                radius="md"
              />
              <TextInput
                label="Email Address"
                type="email"
                placeholder="e.g. jane@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                radius="md"
              />
              <Button
                type="submit"
                fullWidth
                radius="md"
                style={{ backgroundColor: "#F08C23" }}
              >
                Send Application
              </Button>
              <Text size="xs" c="dimmed" ta="center">
                Or call / WhatsApp:{" "}
                <a
                  href="https://wa.me/254757539000"
                  target="_blank"
                  rel="noreferrer"
                  className="text-orange-500 font-medium"
                >
                  0757 539 000
                </a>
              </Text>
            </Stack>
          </form>
        )}
      </Modal>

      <div className="rounded-2xl bg-gradient-to-br from-[#F08C23] to-orange-400 p-4 text-white shadow-lg flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-1">
          <Plug className="w-5 h-5 flex-shrink-0" />
          <span className="font-bold text-sm leading-tight">
            Become a Keyman Plug
          </span>
        </div>
        <p className="text-xs text-orange-100 leading-relaxed">
          Earn money helping stores join and trade safely.
        </p>
        <ul className="text-xs text-orange-100 space-y-0.5 flex-1">
          {perks.map((p) => (
            <li key={p} className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-orange-200" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={open}
          className="mt-2 w-full bg-white text-[#F08C23] font-bold text-xs py-2 px-3 rounded-xl hover:bg-orange-50 transition-colors duration-200 shadow-sm"
        >
          Join as a Plug →
        </button>
      </div>
    </>
  );
};
