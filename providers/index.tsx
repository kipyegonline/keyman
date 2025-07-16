import React from "react";
import ReactQueryProvider from "./Tanstack";
import MantineAppProvider from "./Mantine";
import AppContextProvider from "./AppContext";
import { CartProvider } from "./CartContext";

export default function AppProviders({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryProvider>
      <MantineAppProvider>
        <CartProvider>
          <AppContextProvider>{children}</AppContextProvider>
        </CartProvider>
      </MantineAppProvider>
    </ReactQueryProvider>
  );
}
//https://mantine.dev/colors-generator/?color=3D6B2C
