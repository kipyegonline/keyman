"use client";
import React from "react";
import Link from "next/link";
import { Image } from "@mantine/core";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t transition-all duration-300 bg-gradient-to-br from-green-600 to-green-800 border-green-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Logo Section */}
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <Image
                src="/keyman_logo.png"
                alt="Keyman Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white">KEYMAN</span>
              <span className="text-sm font-medium text-white">STORES</span>
            </div>
          </div>

          {/* Privacy Policy Section */}
          <div className="flex justify-center">
            <Link
              href="/privacy-policy"
              className="text-sm font-medium text-white transition-colors hover:text-green-200"
            >
              Privacy Policy
            </Link>
          </div>

          {/* Terms of Use Section */}
          <div className="flex justify-center md:justify-end">
            <Link
              href="/terms-of-use"
              className="text-sm font-medium text-white transition-colors hover:text-green-200"
            >
              Terms of Use
            </Link>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-6 pt-6 border-t border-green-500">
          <div className="text-center">
            <p className="text-sm text-white">
              &copy; {currentYear} Keyman Stores. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
