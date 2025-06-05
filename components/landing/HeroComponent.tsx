import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Zap, Building2, ShoppingCart } from 'lucide-react';

const AnimatedHeroSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Add custom animations to document head
    const style = document.createElement('style');
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
    <section className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 overflow-hidden pt-[60px]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-[#3D6B2C]/10 to-[#4CAF50]/10 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-[#F08C23]/10 to-orange-300/10 rounded-full blur-3xl floating-animation" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-200/5 to-purple-200/5 rounded-full blur-3xl floating-animation" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-screen grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Content Section */}
          <div 
            className={`space-y-8 ${isVisible ? 'animate-slideInLeft' : 'opacity-0'}`}
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
                <div className="text-sm font-medium text-[#F08C23] -mt-1">STORES</div>
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <div className="relative">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  <div className="text-gradient mb-2">BUY SMART.</div>
                  <div className="text-gradient">BUILD SMART.</div>
                </h1>
                
                {/* Floating Icons */}
                <div 
                  className="absolute -right-4 top-4 parallax-element "
                  style={{ 
                    transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` 
                  }}
                >
                  <Sparkles className="w-6 h-6 text-[#F08C23] animate-bounce-slow" />
                </div>
                
                <div 
                  className="absolute -left-8 bottom-4 parallax-element"
                  style={{ 
                    transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px)` 
                  }}
                >
                  <Zap className="w-5 h-5 text-[#4CAF50] floating-animation" style={{ animationDelay: '0.5s' }} />
                </div>
              </div>

              {/* Description */}
              <p className={`text-lg sm:text-xl text-gray-600 max-w-lg leading-relaxed ${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
                Compare prices, shop with confidence, and get your order delivered to site.
              </p>
            </div>

            {/* Call to Action Button */}
            <div className={`${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
              <button 
                className="group relative bg-gradient-to-r from-[#F08C23] to-orange-400 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-pulse-custom overflow-hidden"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative flex items-center space-x-3">
                  <ShoppingCart className={`w-6 h-6 transition-transform duration-300 ${isHovering ? 'rotate-12 scale-110' : ''}`} />
                  <span>Get Started</span>
                  <ArrowRight className={`w-6 h-6 transition-transform duration-300 ${isHovering ? 'translate-x-2' : ''}`} />
                </div>
              </button>
              
              {/* Additional Info */}
              <p className="text-sm text-gray-500 mt-3 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Join 10,000+ satisfied builders</span>
              </p>
            </div>

            {/* Stats or Features */}
            <div className={`grid grid-cols-3 gap-4 pt-8 ${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`} style={{ animationDelay: '0.9s' }}>
              {[
                { number: '500+', label: 'Products' },
                { number: '100+', label: 'Suppliers' },
                { number: '24/7', label: 'Support' }
              ].map((stat, index) => (
                <div key={index} className="text-center group hover:scale-105 transition-transform duration-200">
                  <div className="text-2xl sm:text-3xl font-bold text-[#3D6B2C] group-hover:text-[#F08C23] transition-colors">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image Section */}
          <div className={`relative ${isVisible ? 'animate-slideInRight' : 'opacity-0'}`}>
            <div className="relative h-96 sm:h-[500px] lg:h-[600px] rounded-3xl overflow-hidden group">
              {/* Main Image Container */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#F08C23] to-orange-400 rounded-3xl transform group-hover:scale-105 transition-transform duration-700">
                {/* Construction Tools Illustration */}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="relative w-full h-full">
                    {/* Yellow Cable/Wire */}
                    <div className="absolute top-8 left-8 right-8">
                      <div className="h-8 bg-yellow-400 rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-500" style={{ clipPath: 'polygon(0 40%, 100% 40%, 95% 60%, 5% 60%)' }}></div>
                    </div>
                    
                    {/* Orange Hard Hat */}
                    <div className="absolute top-16 right-12 w-24 h-20 bg-gradient-to-b from-orange-500 to-orange-600 rounded-t-full shadow-xl transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-500"></div>
                    
                    {/* Construction Tools */}
                    <div className="absolute bottom-16 left-8 right-8 h-32 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg shadow-2xl transform group-hover:translate-y-2 transition-transform duration-500">
                      {/* Tool handles and details */}
                      <div className="absolute top-4 left-4 right-4 h-4 bg-yellow-600 rounded opacity-80"></div>
                      <div className="absolute bottom-4 left-4 w-16 h-8 bg-red-600 rounded shadow-md"></div>
                      <div className="absolute bottom-4 right-4 w-12 h-12 bg-blue-600 rounded-full shadow-md"></div>
                    </div>
                    
                    {/* Floating Particles */}
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-white/30 rounded-full floating-animation"
                        style={{
                          top: `${20 + (i * 10)}%`,
                          left: `${15 + (i * 12)}%`,
                          animationDelay: `${i * 0.3}s`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/30 transition-all duration-500"></div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#4CAF50] rounded-full animate-bounce-slow"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-[#F08C23] rounded-full floating-animation" style={{ animationDelay: '1s' }}></div>
            </div>
            
            {/* Quality Badge */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg transform group-hover:scale-105 transition-transform duration-300">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-800">Quality Assured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-16 sm:h-20 lg:h-24 fill-white">
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default AnimatedHeroSection;