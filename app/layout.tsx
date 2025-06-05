"use client"
import { Poppins } from "next/font/google";
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import "./globals.css";
import AppProviders from "@/providers";
import { NavigationComponent } from "@/components/ui/Navigation";




const poppins=Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable}  antialiased`}
      >
        <AppProviders>
          <NavigationComponent darkMode={false} toggleDarkMode={()=>{}}/>
          {children}
         <ProgressBar  
         height="4px"
          color="#3D6B2C"
          options={{ showSpinner: !false }}
          shallowRouting/>
        </AppProviders>
        
      </body>
    </html>
  );
}
