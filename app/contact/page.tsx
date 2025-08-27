"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  Clock,
  Send,
  User,
  MessageSquare,
  Building2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Zap,
} from "lucide-react";
import { NavigationComponent } from "@/components/ui/Navigation";

export default function ContactPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
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
          transform: translateY(-15px);
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
      
      @keyframes pulse-ring {
        0% {
          transform: scale(0.8);
          opacity: 1;
        }
        100% {
          transform: scale(2);
          opacity: 0;
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
      
      .pulse-ring {
        animation: pulse-ring 2s infinite;
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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value);
      });

      // Replace 'your-email@example.com' with your actual email
      const response = await fetch("info@keymanstores.com", {
        method: "POST",
        body: form,
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          subject: "",
          message: "",
        });
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 overflow-hidden">
      <NavigationComponent isFixed={!false} />
      {/* Hero Section */}
      <section
        className="relative py-20 px-4 sm:px-6 lg:px-8"
        onMouseMove={handleMouseMove}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-float"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-orange-400/20 to-amber-400/20 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "1s" }}
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
              className="absolute -top-4 left-1/4 parallax-element"
              style={{
                transform: `translate(${mousePosition.x * 0.5}px, ${
                  mousePosition.y * 0.5
                }px)`,
              }}
            >
              <Sparkles className="w-8 h-8 text-orange-400 animate-float" />
            </div>

            <div
              className="absolute -top-2 right-1/4 parallax-element"
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
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                <span className="gradient-text">Get in Touch</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Need assistance or have questions? Our dedicated team at Keyman
                Stores, your trusted online construction and hardware platform,
                is here to help.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Information - Left on desktop, second on mobile */}
            <div
              className={`order-2 lg:order-1 space-y-8 ${
                isVisible ? "animate-slideInLeft" : "opacity-0"
              }`}
            >
              {/* Contact Cards */}
              <div className="space-y-6">
                {[
                  {
                    icon: Mail,
                    title: "Email Support",
                    info: "info@keymanstores.com",
                    subinfo: "keymanstores@gmail.com",
                    color: "from-blue-500 to-blue-600",
                  },
                  {
                    icon: Phone,
                    title: "Call/WhatsApp Orders",
                    info: "+254 757 539 000",
                    subinfo: "Mon-Sat 8AM-5PM",
                    color: "from-green-500 to-green-600",
                  },
                  {
                    icon: MessageSquare,
                    title: "Live Chat Support",
                    info: "Available Now",
                    subinfo: "Mon-Sun 8AM-5PM",
                    color: "from-orange-500 to-orange-600",
                  },
                  {
                    icon: Clock,
                    title: "Support Hours",
                    info: "Monday - Friday 8AM-5PM",
                    subinfo: "Saturday 8AM-12PM",
                    color: "from-purple-500 to-purple-600",
                  },
                ].map((contact, index) => (
                  <div
                    key={index}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 transition-all duration-500 hover:scale-105"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${contact.color} rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}
                      >
                        <contact.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-green-600 group-hover:to-orange-500 transition-all duration-300">
                          {contact.title}
                        </h3>
                        <p className="text-gray-900 font-medium">
                          {contact.info}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {contact.subinfo}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Placeholder */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-500">
                <div className="h-64 bg-gradient-to-br from-green-400 to-orange-400 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Building2 className="w-16 h-16 mx-auto mb-4 opacity-75 animate-float" />
                      <p className="text-lg font-medium">Online Platform</p>
                      <p className="text-sm opacity-75">
                        Serving Kenya & Beyond
                      </p>
                    </div>
                  </div>
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 shimmer-effect opacity-30"></div>

                  {/* Pulse Ring */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                    <div className="absolute inset-0 w-4 h-4 bg-white rounded-full pulse-ring"></div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Digital Marketplace
                  </h3>
                  <p className="text-gray-600">
                    Your trusted online construction and hardware platform,
                    connecting buyers with quality materials and verified
                    service providers across Kenya.
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gradient-to-r from-green-600 to-orange-600 rounded-2xl p-8 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJtMzYgMzQgNi0yLTYtMi02IDIgNiAyeiIvPjwvZz48L2c+PC9zdmc+')] bg-repeat"></div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4">
                    Quick Order Support
                  </h3>
                  <p className="text-green-100 mb-6 leading-relaxed">
                    Need to place an urgent order for construction materials,
                    hardware supplies, or services? Our team is ready to assist
                    you.
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
                    <span className="font-medium">
                      Order Hotline: +254 757 539 000
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form - Right on desktop, first on mobile */}
            <div
              className={`order-1 lg:order-2 ${
                isVisible ? "animate-slideInRight" : "opacity-0"
              }`}
            >
              <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-green-400/10 rounded-full -translate-y-8 translate-x-8"></div>

                <div className="relative z-10">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Send us a <span className="gradient-text">Message</span>
                    </h2>
                    <p className="text-gray-600">
                      Fill out the form below for detailed inquiries about
                      construction materials, tools, or services. We provide
                      fast, reliable, and friendly support.
                    </p>
                  </div>

                  {/* Status Messages */}
                  {submitStatus === "success" && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-800">
                        Message sent successfully! We&apos;ll be in touch soon.
                      </span>
                    </div>
                  )}

                  {submitStatus === "error" && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-red-800">
                        Something went wrong. Please try again or contact us
                        directly.
                      </span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Hidden FormSubmit fields */}
                    <input type="hidden" name="_captcha" value="false" />
                    <input type="hidden" name="_template" value="table" />
                    <input
                      type="hidden"
                      name="_next"
                      value={
                        typeof window !== "undefined"
                          ? window.location.href
                          : ""
                      }
                    />

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="relative group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 group-hover:border-gray-400"
                            placeholder="John Doe"
                          />
                        </div>
                      </div>

                      <div className="relative group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 group-hover:border-gray-400"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="relative group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 group-hover:border-gray-400"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>

                      <div className="relative group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                          <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 group-hover:border-gray-400"
                            placeholder="Your Company Name"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="relative group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 group-hover:border-gray-400"
                      >
                        <option value="">Select a subject</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Construction Materials">
                          Construction Materials
                        </option>
                        <option value="Hardware Supplies">
                          Hardware Supplies
                        </option>
                        <option value="Service Provider Partnership">
                          Service Provider Partnership
                        </option>
                        <option value="Order Support">Order Support</option>
                        <option value="Technical Support">
                          Technical Support
                        </option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="relative group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-4 w-5 h-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={6}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 group-hover:border-gray-400 resize-none"
                          placeholder="Tell us about your construction project, material needs, or how we can help..."
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative w-full bg-gradient-to-r from-green-600 to-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                    >
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="relative flex items-center justify-center space-x-3">
                        <Send
                          className={`w-6 h-6 transition-transform duration-300 ${
                            isSubmitting
                              ? "animate-spin"
                              : "group-hover:translate-x-1"
                          }`}
                        />
                        <span>
                          {isSubmitting ? "Sending..." : "Send Message"}
                        </span>
                      </div>
                    </button>
                  </form>
                </div>
              </div>
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
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
