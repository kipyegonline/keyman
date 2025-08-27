import { Container } from "@mantine/core";
import React from "react";
import SupplierContractPage from "./page.contract";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supplier Contract Management - Keyman Stores",
  description:
    "Manage construction contracts as a supplier. View, respond to, and fulfill project agreements with customers. Track milestones and payments.",
  keywords: [
    "supplier dashboard",
    "contract management",
    "construction supplier",
    "project fulfillment",
    "supplier contracts",
    "milestone management",
    "payment tracking",
    "Keyman",
    "supplier portal"
  ],
};

export default function KeyContractPage() {
  return (
    <Container>
      <SupplierContractPage />
    </Container>
  );
}
