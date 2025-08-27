"use client";
// eslint disable
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  ShoppingCart,
  Award,
  Target,
  Heart,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Globe,
  Zap,
} from "lucide-react";
import { NavigationComponent } from "@/components/ui/Navigation";

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);

    // Add custom animations
    const style = document.createElement("style");
    style.textContent = `
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
      
      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-20px);
        }
      }
      
      @keyframes pulse-glow {
        0%, 100% {
          box-shadow: 0 0 20px rgba(240, 140, 35, 0.3);
        }
        50% {
          box-shadow: 0 0 40px rgba(240, 140, 35, 0.6);
        }
      }
      
      @keyframes shimmer {
        0% {
          background-position: -200% center;
        }
        100% {
          background-position: 200% center;
        }
      }
      
      .animate-fadeInUp {
        animation: fadeInUp 0.8s ease-out;
      }
      
      .animate-slideInLeft {
        animation: slideInLeft 0.8s ease-out;
      }
      
      .animate-slideInRight {
        animation: slideInRight 0.8s ease-out;
      }
      
      .animate-float {
        animation: float 3s ease-in-out infinite;
      }
      
      .animate-pulse-glow {
        animation: pulse-glow 2s ease-in-out infinite;
      }
      
      .shimmer-effect {
        background: linear-gradient(90deg, 
          transparent, 
          rgba(255,255,255,0.4), 
          transparent
        );
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
      }
      
      .gradient-text {
        background: linear-gradient(135deg, #F08C23, #3D6B2C, #4CAF50);
        background-size: 200% 200%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: shimmer 3s ease-in-out infinite;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 overflow-hidden">
      <NavigationComponent isFixed />
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
        onMouseMove={handleMouseMove}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-float"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-orange-400/20 to-amber-400/20 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-300/10 to-orange-300/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div
            className={`space-y-8 ${
              isVisible ? "animate-fadeInUp" : "opacity-0"
            }`}
          >
            {/* Floating Icons */}
            <div
              className="absolute -top-8 left-1/4 parallax-element"
              style={{
                transform: `translate(${mousePosition.x * 0.5}px, ${
                  mousePosition.y * 0.5
                }px)`,
              }}
            >
              <Sparkles className="w-8 h-8 text-orange-400 animate-float" />
            </div>

            <div
              className="absolute -top-4 right-1/4 parallax-element"
              style={{
                transform: `translate(${mousePosition.x * -0.3}px, ${
                  mousePosition.y * -0.3
                }px)`,
              }}
            >
              <Zap
                className="w-6 h-6 text-green-500 animate-float"
                style={{ animationDelay: "0.5s" }}
              />
            </div>

            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="gradient-text">About</span>
                <br />
                <span className="gradient-text">KEYMAN</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                A purely Kenyan innovation transforming the construction
                industry through a digital marketplace connecting buyers with
                quality materials, verified service providers, and skilled
                professionals across Kenya and beyond.
              </p>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 max-w-2xl mx-auto">
              {[
                { number: "100%", label: "Quality Guarantee" },
                { number: "Kenya", label: "Best Prices" },
                { number: "24/7", label: "Convenience" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="group hover:scale-110 transition-transform duration-300"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="text-3xl md:text-4xl font-bold gradient-text">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-green-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJtMzYgMzQgNi0yLTYtMi02IDIgNiAyeiIvPjwvZz48L2c+PC9zdmc+')] bg-repeat"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div
              className={`space-y-6 ${
                isVisible ? "animate-slideInLeft" : "opacity-0"
              }`}
            >
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-white backdrop-blur-sm">
                  <Target className="w-5 h-5 mr-2" />
                  Our Mission
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  Our Vision
                  <span className="text-orange-300"> & Mission</span>
                </h2>
                <p className="text-xl text-green-100 leading-relaxed mb-6">
                  <strong>Vision:</strong> To bring everything construction—from
                  quality materials and services to skilled professionals—closer
                  to you, both in Kenya and globally, making construction easy,
                  affordable, and efficient.
                </p>
                <p className="text-xl text-green-100 leading-relaxed">
                  <strong>Mission:</strong> We deliver 100% quality construction
                  materials and services while sourcing the best prices in Kenya
                  without compromising quality. We provide convenient shopping
                  experiences and wider market access for all.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  "Deliver 100% quality construction materials and services",
                  "Source the best prices in Kenya without compromising quality",
                  "Provide convenient shopping experience at the tap of a button",
                  "Offer wider market access for sellers and service providers",
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 text-white group hover:translate-x-2 transition-transform duration-300"
                  >
                    <CheckCircle className="w-6 h-6 text-orange-300 group-hover:scale-110 transition-transform" />
                    <span className="text-lg">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Placeholder */}
            <div
              className={`${isVisible ? "animate-slideInRight" : "opacity-0"}`}
            >
              <div className="relative group">
                <div className="w-full h-96 bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl shadow-2xl overflow-hidden animate-pulse-glow">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Building2 className="w-24 h-24 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium invisible">
                        Mission Image Placeholder
                      </p>
                      <p className="text-sm opacity-75 invisible">
                        Replace with construction/team photo
                      </p>
                    </div>
                  </div>
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 shimmer-effect opacity-30"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div
            className={`text-center mb-16 ${
              isVisible ? "animate-fadeInUp" : "opacity-0"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Our Code of Business</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The Foundational Guide to Marketplace Order, Fair Trade, and
              Community Trust. At Keyman Stores, trust is our strongest
              currency.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Protect Trust",
                description:
                  "Trust is stronger than any currency; without it, trade cannot thrive.",
                color: "from-red-500 to-pink-500",
              },
              {
                icon: Users,
                title: "Safeguard Buyers & Sellers",
                description:
                  "Ensuring both parties walk away satisfied from every transaction.",
                color: "from-yellow-500 to-orange-500",
              },
              {
                icon: Globe,
                title: "Build Long-Term Relationships",
                description:
                  "Honest dealings today bring repeat customers tomorrow.",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: Building2,
                title: "Protect Store Reputation",
                description:
                  "Fairness maintains credibility and integrity in our marketplace.",
                color: "from-blue-500 to-indigo-500",
              },
              {
                icon: Sparkles,
                title: "Strengthen the Marketplace",
                description:
                  "Integrity attracts quality clients, suppliers, and opportunities.",
                color: "from-purple-500 to-violet-500",
              },
              {
                icon: Award,
                title: "Honor Commitments",
                description:
                  "Every agreement is a promise kept - our word is our bond.",
                color: "from-teal-500 to-cyan-500",
              },
              {
                icon: CheckCircle,
                title: "Prevent Exploitation",
                description:
                  "Protecting the vulnerable from unfair practices and ensuring fairness for all.",
                color: "from-red-400 to-pink-400",
              },
              {
                icon: Zap,
                title: "Encourage Healthy Competition",
                description:
                  "Quality and talent determine success, not deception or unfair practices.",
                color: "from-yellow-400 to-orange-400",
              },
              {
                icon: Globe,
                title: "Uphold the Law",
                description:
                  "Legal compliance is non-negotiable in all our operations and dealings.",
                color: "from-green-400 to-emerald-400",
              },
              {
                icon: Building2,
                title: "Empower Growth",
                description:
                  "A safe platform enables business expansion and prosperity for all participants.",
                color: "from-blue-400 to-indigo-400",
              },
              {
                icon: Heart,
                title: "Protect Community Goodwill",
                description:
                  "A trustworthy marketplace is one people recommend to friends and family.",
                color: "from-purple-400 to-violet-400",
              },
              {
                icon: Sparkles,
                title: "Honor Goodness",
                description:
                  "Guided by honesty, fairness, practicality, and ethical principles in everything we do.",
                color: "from-teal-400 to-cyan-400",
              },
            ].map((value, index) => (
              <div
                key={index}
                className={`group relative bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 ${
                  isVisible ? "animate-fadeInUp" : "opacity-0"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Icon */}
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}
                >
                  <value.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-green-600 group-hover:to-orange-500 transition-all duration-300">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                  {value.description}
                </p>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-orange-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-green-50">
        <div className="max-w-6xl mx-auto">
          <div
            className={`text-center mb-16 ${
              isVisible ? "animate-fadeInUp" : "opacity-0"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Who We Are</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Keyman Stores is a purely Kenyan innovation dedicated to
              transforming the construction industry through digital marketplace
              solutions.
            </p>
          </div>

          {/* History Section */}
          <div className="text-center mb-12 max-w-4xl mx-auto">
            <div
              className={`bg-white rounded-3xl shadow-lg p-8 lg:p-12 ${
                isVisible ? "animate-fadeInUp" : "opacity-0"
              }`}
              style={{ animationDelay: "0.3s" }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                <span className="gradient-text">Our History</span>
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Keyman Stores was established to solve common challenges in the
                Kenyan construction industry. Many homeowners, contractors, and
                businesses face difficulty accessing reliable materials, fair
                pricing, and verified service providers.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                We set out to create a digital construction marketplace that
                addresses these gaps, connecting buyers with verified sellers,
                tools, and services while ensuring transparency, trust, and
                convenience for {`Kenya's`} construction sector.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: CheckCircle,
                title: "Verified Sellers & Service Providers",
                description:
                  "Trade confidently with trusted professionals who have been thoroughly vetted.",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: Award,
                title: "Competitive Prices & Quality",
                description:
                  "Access the best deals in Kenya without compromising on quality standards.",
                color: "from-blue-500 to-indigo-500",
              },
              {
                icon: Zap,
                title: "Convenience at Your Fingertips",
                description:
                  "Browse, compare, and order materials or services anytime, anywhere.",
                color: "from-yellow-500 to-orange-500",
              },
              {
                icon: Heart,
                title: "Safe & Fair Marketplace",
                description:
                  "Our principles ensure honest dealings, protecting both buyers and sellers.",
                color: "from-red-500 to-pink-500",
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className={`group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:scale-105 p-8 ${
                  isVisible ? "animate-fadeInUp" : "opacity-0"
                }`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${benefit.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}
                >
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-green-600 group-hover:to-orange-500 transition-all duration-300">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                  {benefit.description}
                </p>

                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-orange-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 via-green-700 to-orange-600 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1vcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div
            className={`space-y-8 ${
              isVisible ? "animate-fadeInUp" : "opacity-0"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Ready to Experience
              <span className="text-orange-300"> Keyman Stores?</span>
            </h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              Join the growing community of builders, contractors, and suppliers
              transforming {`Kenya's`} construction industry through our trusted
              digital marketplace.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <a
                href="/account/login"
                className="group relative bg-white text-green-700 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-3">
                  <ShoppingCart className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Get Started</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </a>

              <Link
                href="/suppliers-near-me"
                className="group px-8 py-4 border-2 border-white text-white rounded-2xl font-bold text-lg hover:bg-white hover:text-green-700 transition-all duration-300"
              >
                Find Suppliers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <div className="bg-white py-8">
        <div className="text-center hidden">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-orange-500 text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
