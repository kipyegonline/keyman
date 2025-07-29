import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Store,
  ArrowRight,
  Sparkles,
  Trophy,
  Star,
  Building2,
  Zap,
  Heart,
  Crown,
} from "lucide-react";

interface SupplierAlreadyRegisteredProps {
  onProceedToDashboard: () => void;
  businessName?: string;
  supplierType?: string;
}

const SupplierAlreadyRegistered: React.FC<SupplierAlreadyRegisteredProps> = ({
  onProceedToDashboard,
  businessName = "Your Business",
  supplierType = "Supplier",
}) => {
  const [showContent, setShowContent] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(false);

  useEffect(() => {
    // Staggered animations
    setTimeout(() => setShowContent(true), 200);
    setTimeout(() => setShowCelebration(true), 800);
    setTimeout(() => setPulseEffect(true), 1200);
  }, []);

  const celebrationElements = [
    { icon: <Star className="w-4 h-4" />, delay: 0, color: "#F08C23" },
    { icon: <Sparkles className="w-3 h-3" />, delay: 200, color: "#3D6B2C" },
    { icon: <Trophy className="w-4 h-4" />, delay: 400, color: "#F08C23" },
    { icon: <Heart className="w-3 h-3" />, delay: 600, color: "#E53E3E" },
    { icon: <Crown className="w-4 h-4" />, delay: 800, color: "#3D6B2C" },
    { icon: <Zap className="w-3 h-3" />, delay: 1000, color: "#F08C23" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-white to-orange-50">
      {/* Floating celebration elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {showCelebration &&
          celebrationElements.map((element, index) => (
            <div
              key={index}
              className={`absolute transition-all duration-1000 transform ${
                showCelebration
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 80 + 10}%`,
                transitionDelay: `${element.delay}ms`,
                color: element.color,
                animation: `float ${
                  3 + Math.random() * 2
                }s ease-in-out infinite`,
                animationDelay: `${element.delay}ms`,
              }}
            >
              {element.icon}
            </div>
          ))}
      </div>

      <div
        className={`w-full max-w-2xl transition-all duration-800 transform ${
          showContent
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-12 opacity-0 scale-95"
        }`}
      >
        <div className="relative p-8 md:p-12 shadow-2xl rounded-3xl bg-gradient-to-br from-white via-green-50/30 to-orange-50/30 border-2 border-gradient-to-r from-green-200 to-orange-200 overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-green-200/20 to-orange-200/20 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-gradient-to-tr from-orange-200/20 to-green-200/20 rounded-full animate-bounce"></div>
            <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-gradient-to-r from-green-300/30 to-transparent rotate-45 animate-spin"></div>
            <div className="absolute bottom-1/3 left-1/4 w-6 h-6 bg-gradient-to-l from-orange-300/30 to-transparent rotate-12 animate-pulse"></div>
          </div>

          <div className="space-y-8 relative z-10">
            {/* Header with Icon */}
            <div className="text-center">
              <div
                className={`inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-gradient-to-r from-green-500 to-green-600 shadow-2xl transition-all duration-1000 transform ${
                  showContent ? "scale-100 rotate-0" : "scale-75 rotate-180"
                } ${pulseEffect ? "animate-pulse" : ""}`}
              >
                <Store className="w-12 h-12 text-white" />
              </div>

              <div
                className={`transition-all duration-1000 delay-300 transform ${
                  showContent
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-700 via-green-600 to-green-800 bg-clip-text text-transparent mb-3">
                  🎉 Welcome Back!
                </h1>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-orange-100 rounded-full border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-semibold">
                    Account Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Main Message */}
            <div
              className={`text-center space-y-4 transition-all duration-1000 delay-500 transform ${
                showContent
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <div className="p-6 bg-gradient-to-r from-green-50 to-orange-50 rounded-2xl border-2 border-gradient-to-r from-green-200 to-orange-200 shadow-lg">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
                  🏪 Your Store is Ready & Good to Go!
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Great news!{" "}
                  <span className="font-semibold text-green-700">
                    {businessName}
                  </span>{" "}
                  is already registered and active in the Keyman Network. Your{" "}
                  {supplierType.toLowerCase()} store is live and ready to
                  receive requests from customers!
                </p>
              </div>

              {/* Features Highlight */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {[
                  {
                    icon: <CheckCircle className="w-6 h-6" />,
                    text: "Store Active",
                    color: "green",
                  },
                  {
                    icon: <Star className="w-6 h-6" />,
                    text: "Profile Complete",
                    color: "orange",
                  },
                  {
                    icon: <Zap className="w-6 h-6" />,
                    text: "Ready for Orders",
                    color: "green",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className={`p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md transition-all duration-700 delay-${
                      (index + 1) * 200
                    } transform hover:scale-105 ${
                      showContent
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                  >
                    <div
                      className={`text-${feature.color}-600 mb-2 flex justify-center`}
                    >
                      {feature.icon}
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      {feature.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div
              className={`text-center transition-all duration-1000 delay-700 transform ${
                showContent
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <button
                onClick={onProceedToDashboard}
                className={`group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 via-green-700 to-green-800 hover:from-green-700 hover:via-green-800 hover:to-green-900 text-white font-bold text-lg rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-green-500/25 ${
                  pulseEffect ? "animate-pulse" : ""
                } border-2 border-green-500`}
              >
                <Building2 className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                <span>Proceed to Dashboard</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              <p className="text-sm text-gray-600 mt-4">
                Manage your store, view orders, and track your business growth
              </p>
            </div>

            {/* Achievement Badge */}
            <div
              className={`text-center transition-all duration-1000 delay-900 transform ${
                showContent ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold rounded-full shadow-lg">
                <Trophy className="w-5 h-5" />
                <span>Keyman Network Member</span>
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
      `}</style>
    </div>
  );
};

export default SupplierAlreadyRegistered;
