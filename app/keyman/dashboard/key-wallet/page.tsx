import React from "react";
import { Container } from "@mantine/core";
import WalletClientComponent from "./page.component";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wallet | Keyman Stores",
  description: "Manage your digital wallet, view balance, send money, and track transactions on Keyman Stores - Kenya's trusted construction marketplace platform.",
  keywords: [
    "digital wallet",
    "keyman stores wallet", 
    "mobile money",
    "construction payments",
    "Kenya wallet",
    "supplier payments",
    "send money",
    "wallet balance",
    "transaction history",
    "phone verification"
  ],
  openGraph: {
    title: "My Wallet | Keyman Stores",
    description: "Securely manage your digital wallet, payments, and earnings on Keyman Stores construction marketplace.",
    type: "website",
    locale: "en_KE",
  },
  twitter: {
    card: "summary",
    title: "My Wallet | Keyman Stores", 
    description: "Manage your digital wallet and payments on Kenya's leading construction marketplace.",
  },
  robots: {
    index: false, // Wallet pages should not be indexed for privacy
    follow: false,
  }
};

export default function KeyWallet() {
  return (
    <Container>
      <WalletClientComponent />
    </Container>
  );
}
