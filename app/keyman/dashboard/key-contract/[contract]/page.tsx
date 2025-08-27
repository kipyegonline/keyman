import { Container } from "@mantine/core";
import React from "react";
import ClientContractPage from "./page.component";
import { Metadata } from "next";
interface PageProps {
  params: Promise<{ contract: string }>;
}
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
    "construction management",
  ],
};
export default async function ContractPage({ params }: PageProps) {
  const { contract } = await params;

  return (
    <Container>
      <ClientContractPage contractId={contract} />
    </Container>
  );
}
