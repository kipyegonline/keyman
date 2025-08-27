import { Container } from "@mantine/core";
import React from "react";
import CustomerContractCreation from "./page.component";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Key Contract Management - Keyman Stores",
  description:
    "Create, manage, and track construction contracts with suppliers and service providers. Streamline your project agreements and milestone management.",
  keywords: [
    "contract management",
    "construction contracts",
    "project agreements",
    "supplier contracts",
    "milestone tracking",
    "Keyman",
    "construction management"
  ],
};
export default function KeyContractPage() {
  return (
    <Container>
      <CustomerContractCreation />
    </Container>
  );
}
