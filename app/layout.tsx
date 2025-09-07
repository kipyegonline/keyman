"use client";
import { Poppins } from "next/font/google";
import { AppProgressProvider as ProgressBar } from "@bprogress/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import AppProviders from "@/providers";

import { COLOUR } from "@/CONSTANTS/color";
import "./globals.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/nprogress/styles.css";
import "@mantine/dates/styles.css";
import "leaflet/dist/leaflet.css";
import "@mantine/carousel/styles.css";
//import ChatBot from "@/components/keyman-bot";
import AnalyticsScripts from "@/components/ui/AnalyticsScript";
import { Footer } from "@/components/ui/Footer";
//import ChatBot from "@/components/keyman-bot";
//import ChatBot from "@/components/keyman-bot/v2";
import RequestChatWidget from "@/components/requests/RequestChatWidget";
import React from "react";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
const TrackingId = "G-RWPNV6R05V";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <html lang="en">
      <body className={`${poppins.variable}  antialiased`}>
        <AppProviders>
          <main className=""> {children}</main>
          <Footer />
          <AnalyticsScripts />
          <GoogleAnalytics gaId={TrackingId} />

          <RequestChatWidget
            isOpen={isOpen}
            handleToggle={() => setIsOpen((prev) => !prev)}
          />

          <ProgressBar
            height="4px"
            color={COLOUR.secondary}
            options={{ showSpinner: !false }}
            shallowRouting
          />
        </AppProviders>
      </body>
    </html>
  );
}
