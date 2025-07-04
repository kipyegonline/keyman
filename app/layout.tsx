"use client";
import { Poppins } from "next/font/google";
import { AppProgressProvider as ProgressBar } from "@bprogress/next";

import AppProviders from "@/providers";

import { COLOUR } from "@/CONSTANTS/color";
import "./globals.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/nprogress/styles.css";
import "@mantine/dates/styles.css";
import "leaflet/dist/leaflet.css";
import ChatBot from "@/components/keyman-bot";
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable}  antialiased`}>
        <AppProviders>
          <main className=""> {children}</main>
          <ChatBot />

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
