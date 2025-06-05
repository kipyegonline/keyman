"use client";
import React, { useState } from 'react';
import { Building, Sun, Moon, Menu, X } from 'lucide-react';
export const NavigationComponent: React.FC<{ darkMode: boolean; toggleDarkMode: () => void }> = ({ darkMode, toggleDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-md border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#3D6B2C] to-[#4CAF50] rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>KEYMAN</span>
            <span className="text-sm font-medium text-[#F08C23]">STORES</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
            <button className="bg-gradient-to-r from-[#3D6B2C] to-[#4CAF50] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200">
              Sign Up
            </button>
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <button onClick={toggleDarkMode} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button className="w-full bg-gradient-to-r from-[#3D6B2C] to-[#4CAF50] text-white px-4 py-2 rounded-lg font-medium">
                Sign Up
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};