import { Container } from "@mantine/core";
import React from "react";
import KeyManCoinDashboard from "./page.component";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keyman Coin - Keyman Stores",
  description:
    "Manage your Keyman Coin balance and transactions. Use Keyman Coins for platform services and construction procurement.",
};

export default function Page() {
  return (
    <Container>
      <KeyManCoinDashboard />
    </Container>
  );
}
